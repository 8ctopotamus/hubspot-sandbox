import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs'
import express from 'express'
import pdf from 'html-pdf'
import hubspotClient from './services/hubspot'

const PORT = process.env.PORT || 3001

const app = express()

app.get('/', async (req, res) => {
  try {
    // get a deal    
    const deal = await hubspotClient.crm.deals.basicApi.getById('20218993536', [
      'dealname',
      'dealstage',
      'delivery_address', 
      'delivery_city', 
      'delivery_state', 
      'delivery_zip'
    ])

    const { 
      dealname,
      dealstage,
      delivery_address, 
      delivery_city, 
      delivery_state, 
      delivery_zip
    } = deal.properties
    
    // create and upload pdf
    const html = `
      <h1>${dealname}</h1>
      <p>Stage: ${dealstage}</p>
      <h2>Delivery Info</h2>
      <ul>
        ${[
          delivery_address, 
          delivery_city, 
          delivery_state, 
          delivery_zip
        ]
          .filter(str => !!str)
          .map(str => `<li>${str}</li>`)
          .join('\n')
        }
      </ul>
    `

    const options = { format: 'Letter' }

    pdf.create(html, options).toFile('./test-file.pdf', async function(err, { filename }) {
      if (err) {
        res.status(500).send('Error generating PDF')
      }

      // upload file to hubspot
    //   const formData = new FormData()
    //   const options = {"access": "PRIVATE"}
    //   formData.append('folderPath', '/')
    //   formData.append("options", JSON.stringify(options))
    //   formData.append("file", fs.readFileSync(filename, 'utf-8'))

    //   const uploadResponse = await hubspotClient.apiRequest({
    //     method: 'POST',
    //     // headers: {
    //     //   'Content-Type': 'multipart/form-data',
    //     // },
    //     path: '/filemanager/api/v3/files/upload',
    //     body: formData,
    //     defaultJson: false
    // });


    const options = JSON.stringify({"access": "PUBLIC_INDEXABLE"})
    const uploadResponse = await hubspotClient.files.filesApi.upload(
      { data: fs.readFileSync(filename), name: 'test-file.pdf' }, 
      undefined, 
      '/test-folder', 
      'test-file.pdf', 
      undefined, 
      options
    )
  

      console.log(uploadResponse)

      res.send(html)
    });
  } catch(err) {
    console.log(err)
    res.status(500).send('Server error')
  }
})

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`)
})