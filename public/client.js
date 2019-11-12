/* global axios */

const eventList = document.getElementById('event-list')
const addEventForm = document.getElementById('add-event-form')
addEventForm.onsubmit = onSubmitForm
const deleteEventForm = document.getElementById('delete-event-form')
deleteEventForm.onsubmit = onDeleteForm



/*
 * =========
 * ADD EVENT
 * =========
 */
function onSubmitForm(event) {
  event.preventDefault()
  
  const t = event.target
  
  const reqBody = {
    username: t.username.value,
    password: t.password.value,
    date: t.date.value,
    description: t.description.value
  }
  
  for (let value of Object.values(reqBody)) {
    if (!value) return
  }
  
  axios.post('/event', reqBody)
    .finally(getEventList)
}



/*
 * ============
 * DELETE EVENT
 * ============
 */
function onDeleteForm(event) {
  event.preventDefault()
  
  const t = event.target
  
  const reqBody = {
    username: t.username.value,
    password: t.password.value,
    uuid: t.uuid.value,
  }
  
  for (let value of Object.values(reqBody)) {
    if (!value) return
  }
  
  axios.post('/delete', reqBody)
    .finally(getEventList)
}



/*
 * ===========================
 * GET EVENTS AND DISPLAY THEM
 * ===========================
 */
function getEventList() {
  return axios.get('/event')
    .then(res => updateEventList(res.data))
}

// Creates full list of events
function updateEventList(data) {
  eventList.innerHTML = ''
  
  data.forEach(event => {
    eventList.appendChild(
      createEventSubList(event)
    )
  })
}

// Creates sublist for one event
function createEventSubList(event) {
  const p = document.createElement('p')
  p.innerHTML = `
    <li>
      <ul>
        <li>${event.uuid}</li>
        <li>${event.date}</li>
        <li>${event.description}</li>
      </ul>
    </li>
  `
  return p
}

getEventList()