const auth = require("../auth/auth")
const manager = require('../middlware/manager')
const { Product, Category, Unit } = require("../db/sequelize")
const document = require('pdfkit');
const fs = require('fs')
const PDFDocument = require('pdfkit-table')

const inventory = (app) => {
    app.get('/api/inventory/:id', (auth, manager), (req, res) => {
        Promise.all([
            Product.findAndCountAll(
                { 
                    where: { 
                        CategoryId: req.params.id 
                    },
                    include: [
                        {
                            model: Category,
                        },
                        {
                            model: Unit
                        }
                    ]
                }
            ),
            Category.findByPk(req.params.id)
        ]).then(([{count, rows}, categorie]) => {
            // res.json({ count: count, result: rows, _categorie: categorie })

            let doc = new PDFDocument({ margin: 30, size: 'A4' });

            doc.pipe(fs.createWriteStream("../document.pdf"));

            doc.text(`Inventaire ${categorie.name_catg}`, { align: 'center' });
            doc.moveDown();

            const table = {
                headers: [
                { label:"Numero", property: 'numero', width: 73, renderer: null },
                { label:"Designation", property: 'designation', width: 200, renderer: null }, 
                { label:"Quantité Restant", property: 'quantite', width: 140, renderer: null }, 
                { label:"Uniter", property: 'uniter', width: 140, renderer: null }, 
                ],
                rows: rows.map(item => [item.id, item.name_prod, item.quantity_prod, item.Unite.name_unit])
            };

            doc.table(table, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
                prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),
            });

            doc.pipe(res);

            // done
            doc.end();

        })
        .catch(error => {
            const message = "Categorie de produit introuvable"
            res.status(500).json({ message, data: error })
        })
    })
}

module.exports = { inventory }