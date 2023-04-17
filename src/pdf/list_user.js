const auth = require("../auth/auth")
const admin = require('../middlware/admin')
const { User } = require("../db/sequelize")
const document = require('pdfkit');
const fs = require('fs')
const PDFDocument = require('pdfkit-table')

const listes_user = (app) => {
    app.get('/api/list-user', (auth, admin), (req, res) => {

        User.findAndCountAll().then(({count, rows}) => {

            let doc = new PDFDocument({ margin: 30, size: 'A4' });

            doc.pipe(fs.createWriteStream("../listes.pdf"));

            doc.text(`LISTES DES UTILISATEURS`, { align: 'center' });
            doc.moveDown();

            const table = {
                headers: [
                { label:"ID", property: 'id', width: 60, renderer: null },
                { label:"Nom", property: 'nom', width: 100, renderer: null }, 
                { label:"CODE USER", property: 'codeuser', width: 100, renderer: null }, 
                { label:"NOM CODE", property: 'nomcode', width: 200, renderer: null }, 
                { label:"ADRESSE", property: 'address', width: 93, renderer: null }, 
                ],
                rows: rows.map(item => [item.id, item.name, item.code_user, item.name_code, item.address])
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
            const message = "Impossible de recuperer les listes des utilisateur"
            res.status(500).json({ message, data: error })
        })
    })
}

module.exports = { listes_user }