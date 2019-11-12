var axios = require('axios')
var uuid = require('uuid/v4')
var path = require('path')

// Express setup
var express = require('express')
var bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.json())
app.use(express.static('public'))

// SQLite setup
var fs = require('fs')
var dbFile = './.data/sqlite.db'
var exists = fs.existsSync(dbFile)
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(dbFile)



/*
 * =======
 * HELPERS
 * =======
 */
function noop() {}

function authorized(req) {
  return (
    process.env.ADMIN_USERNAME === req.body.username
    && process.env.ADMIN_PASSWORD === req.body.password
  )
}



/*
 * =============
 * INITIALIZE DB
 * =============
 */
db.serialize(() => {
  if (!exists) {
    db.run('CREATE TABLE Events (uuid Text, date Integer, description Text)')
    console.log('New table Events created!')
  } else {
    console.log('Database Events ready to go!')
    db.each('SELECT * from Events', (err, row) => {
      if (err) {
        console.error(err)
      }

      if (row) {
        console.log('record:', row)
      }
    })
  }
})



/*
 * =======================
 * GET FORM AND EVENT LIST
 * =======================
 */
app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, '/views/index.html'),
  )
})

app.get('/event', (req, res) => {
  db.all('SELECT * from Events', (err, rows) => {
    if (err) {
      return res.sendStatus(500)
    }

    res.send(JSON.stringify(rows))
  })
})



/*
 * =========
 * ADD EVENT
 * =========
 */
app.post('/event', (req, res) => {
  if (authorized(req)) {
    const id = uuid()
    // Convert string date to timestamp (seconds)
    const date = Math.floor(Date.parse(req.body.date) / 1000)
    const description = req.body.description

    db.run(
      `INSERT INTO Events (uuid, date, description) VALUES ("${id}", ${date}, "${description}")`,
      () => res.sendStatus(200),
    )
  }
})



/*
 * ============
 * DELETE EVENT
 * ============
 */
function deleteEvent(id, callback = noop) {
  db.run(
    `DELETE FROM Events WHERE uuid="${id}"`,
    callback,
  )
}

app.post('/delete', function(req, res) {
  if (authorized(req)) {
    const id = req.body.uuid

    deleteEvent(id, () => res.sendStatus(200))
  }
})



/*
 * =================================
 * CHECK FOR EVENTS TO POST TO SLACK
 * =================================
 */
app.get('/check', (req, res) => {
  // Create timestamp (s): now + lookahead
  const lookahead = 3 * 24 * 60 * 60 // 3 days (s)
  const time = Math.floor(Date.now() / 1000) + lookahead

  // Get all events before future timestamp
  db.all(`SELECT * from Events WHERE date <= ${time}`, (err, rows) => {
    if (err) {
      return res.sendStatus(500)
    }

    if (rows.length) {
      // Join events into single string
      let message = ''
      rows.forEach(event => {
        message += '\n\n'
        message += event.description
      })

      // Post events to Slack and then delete events
      axios.post(process.env.EVENT_URL, { text: message })
        .then(() => {
          rows.forEach(event => deleteEvent(event.uuid))
        })
        .then(() => {
          res.send(JSON.stringify(message))
        })
    } else {
      res.send(JSON.stringify(rows))
    }
  })
})

// Start Express listener
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port)
})
