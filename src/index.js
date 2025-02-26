const express = require('express')

const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const libreConvert = require("libreoffice-convert");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const app = express()
const port = 3000

const prisma = new PrismaClient();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/generate/:cpf', async (request, reply) => {
      const getDadosQuerySchema = z.object({
        cpf: z.string(),
      });

      const formatCPF = (cpf) => {
          return cpf.replace(/^([0-9]{3})([0-9]{3})([0-9]{3})([0-9]{2})$/, "$1.$2.$3-$4");
      };

      const formatCurrency = (value) => {
          return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      };

      const { cpf } = getDadosQuerySchema.parse(request.params);

      if (cpf) {
      try {
          const result = await prisma.fucae_irpf.findFirst({
          where: { cpf },
          });

          if (!result) {
          return reply.status(404).send({ message: "CPF inválido ou não encontrado." });
          }

          const templatePath = path.join(__dirname, "..", "..", "..", "tmp", "DIRF2025.docx");
          const content = fs.readFileSync(templatePath, "binary");

          const zip = new PizZip(content);
          const doc = new Docxtemplater(zip);

          const replacements = {
          NOME: result.nome.toString(),
          CPF: formatCPF(cpf.toString()),
          BRUTO: formatCurrency(result.bruto),
          IRPF: formatCurrency(result.irpf),
          };

          doc.render(replacements);

          const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });
          const tempFilePath = path.join("/tmp", "DIRF2025.docx");
          fs.writeFileSync(tempFilePath, docxBuffer);

          const pdfBuffer = await new Promise((resolve, reject) => {
          libreConvert.convert(docxBuffer, ".pdf", undefined, (err, done) => {
              if (err) reject(err);
              resolve(done);
          });
          });

          fs.unlinkSync(tempFilePath);

          reply.header("Content-Disposition", `attachment; filename=DIRF2025-FUCAE.pdf`);
          reply.header("Content-Type", "application/pdf");

          return reply.send(pdfBuffer);
      } catch (err) {
          throw err;
      }
      } else {
      return reply.status(400).send({ message: "CPF is required" });
      }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
