const contextDisplay = document.querySelector('h2')
const title = document.querySelector('#title')
const text = document.querySelector('#body')
const newNote = document.querySelector('#new')
const saveNote = document.querySelector('#save')
const deleteNote = document.querySelector('#delete')
const downloadNote = document.querySelector('#download')
const savedNotesDisplay = document.querySelector('.notes')
const favoritesDisplay = document.querySelector('.favorites')
const deleteNoteModeDisplay = document.querySelector('.delete-favorites')
const noteToDelete = document.querySelector('.notes')
const confirmDelete = document.querySelector('#confirm_delete')
const titleSearchText = document.querySelector('#title_search')
let currentNote
let toDeleteArr = []
let selectedDOMArr = []
let deleteMode = false

const localStorageNotes = JSON.parse(localStorage.getItem('notes'))
let notes = localStorage.getItem('notes') !== null ? localStorageNotes : []


newNote.onclick = () => createNewNote()

saveNote.onclick = () => {
    const titleToSave = title.value
    const textToSave = text.value

    if (!titleToSave || !textToSave) return alert('Escreva algo para salvar')

    if (currentNote) {
        addToNotesArr(currentNote.id, titleToSave, textToSave,
            currentNote.favorite, true)
    }
    else {
        addToNotesArr(undefined, titleToSave, textToSave, false)
    }

    updateNoteLocalStorage()
    init()
}

downloadNote.onclick = () => {
    const titleToDownload = title.value
    const textToDownload = text.value

    if (!titleToDownload || !textToDownload) return alert('Escreva algo para baixar')

    downloadFile(titleToDownload, textToDownload)
}

deleteNote.onclick = () => deleteCurrentNote(currentNote.id)

titleSearchText.oninput = () => searchTitle(titleSearchText.value)

favoritesDisplay.onclick = () => changeFavoriteDisplay()

deleteNoteModeDisplay.onclick = () => {
    console.log('click');

    changeDeleteModeDisplay()

    noteToDelete.addEventListener('click', selectNoteToDelete)
}

confirmDelete.onclick = async () => {
    checkForDelete()

    deleteNoteModeDisplay.click()
    deleteNoteModeDisplay.classList.remove('delete-active')
}

const generateID = () => Math.round(Math.random() * 1000)

const addToNotesArr = (id = undefined, title, body, favorite = false, isUpdate) => {
    if (deleteMode) changeDeleteModeDisplay()

    if (isUpdate) {
        notes.map(note => {
            if (note.id == id) {
                notes = notes.filter(note => note.id !== id)
                console.log(notes);

                notes.push({
                    id: id,
                    title: title,
                    body: body,
                    favorite: favorite
                })
            }
        })
        return alert('Anotação atualizada');
    }
    notes.push({
        id: generateID(),
        title: title,
        body: body,
        favorite: false
    })
}

const addToBeDeletedArr = id => {
    let exist

    notes.map(note => {
        if (note.id == id) {
            toDeleteArr.map(toDeleteId => {
                if (toDeleteId.id == id) {
                    toDeleteArr = toDeleteArr.filter(toDeleteId => toDeleteId.id !== id)
                    exist = true
                }
            })

            if (!exist) toDeleteArr.push({ id: id })
        }
    })
}

const updateNoteLocalStorage = () => {
    localStorage.setItem('notes', JSON.stringify(notes))
}

const deleteCurrentNote = id => {
    notes = notes.filter(note => note.id !== id)
    createNewNote()
    init()
    updateNoteLocalStorage()
}

const checkForDelete = () => {
    toDeleteArr.map(toDelete => {
        notes.map(note => {
            if (note.id === toDelete.id) {
                deleteCurrentNote(toDelete.id)
            }
        })
    })
}

const selectNoteToDelete = e => {
    if (!deleteMode) return
    const hasTitle = e.target.classList.contains('note-title')
    const hasSelect = e.target.classList.contains('select-delete')

    if (hasTitle && !hasSelect) {
        selectedDOMArr.push(e.target)

        e.target.classList.add('select-delete')
        return
    }
    else if (hasSelect) {
        selectedDOMArr = selectedDOMArr.filter(target => target !== e.target)

        e.target.classList.remove('select-delete')
        return
    }
}

const favoriteSelectedNote = id => {
    notes.map(note => {
        if (note.id == id) {
            const isFavorite = note.favorite === false
            if (isFavorite) note.favorite = true
            else note.favorite = false
        }
    })
    init()
    updateNoteLocalStorage()
}

const changeFavoriteDisplay = () => {
    if (deleteMode) changeDeleteModeDisplay()

    const isFavoriteMode = favoritesDisplay.classList.contains('favorites-active')

    if (!isFavoriteMode) {
        favoritesDisplay.classList.replace('favorites', 'favorites-active')
        savedNotesDisplay.innerHTML = ''
        notes.forEach(addFavoritesNotesIntoDOM)
    }
    else {
        favoritesDisplay.classList.replace('favorites-active', 'favorites')
        init()
    }
}

const changeDeleteModeDisplay = () => {
    const isDeleteMode = deleteNoteModeDisplay.classList.contains('delete-active')

    console.log(isDeleteMode);


    if (!isDeleteMode) {
        confirmDelete.classList.remove('hidden')

        deleteNoteModeDisplay.classList.add('delete-active')
        deleteMode = true
    }
    else {
        confirmDelete.classList.add('hidden')
        deleteNoteModeDisplay.classList.remove('delete-active')
        deleteMode = false
        noteToDelete.removeEventListener('click', selectNoteToDelete)
        toDeleteArr = []
        selectedDOMArr.map(target => {
            target.classList.remove('select-delete')
        })
        selectedDOMArr = []
    }
}

const displayNote = id => {
    if (deleteMode) {
        addToBeDeletedArr(id)
        return
    }

    notes.map(note => {
        if (note.id == id) {
            title.value = note.title
            text.value = note.body

            currentNote = {
                id: note.id,
                title: note.title,
                body: note.body,
                favorite: note.favorite
            }
            console.log(currentNote);

            contextDisplay.innerHTML = `Editando nota: ${note.title}`
            deleteNote.style.display = 'flex'
        }
    })
}

const createNewNote = () => {
    if (deleteMode) changeDeleteModeDisplay()

    title.value = ''
    text.value = ''
    currentNote = undefined
    contextDisplay.innerHTML = 'Bloco de Notas'
    deleteNote.style.display = 'none'
    title.focus()
}

const searchTitle = title => {
    if (!title) return init()

    const isFavoriteMode = favoritesDisplay.classList.contains('favorites-active')
    if (isFavoriteMode) {
        favoritesDisplay.classList.replace('favorites-active', 'favorites')
    }

    savedNotesDisplay.innerHTML = ''
    title = title.toUpperCase()
    notes.map(note => {
        const titleCheck = note.title.toUpperCase().indexOf(title) == 0

        if (titleCheck) addNotesIntoDOM(note)
    })
}

const addNotesIntoDOM = ({ id, title, favorite }) => {
    const div = document.createElement('div')
    div.classList.add('note')
    if (favorite) {
        div.innerHTML = `<i class="fas fa-star" onClick="favoriteSelectedNote(${id})"></i>`
    }
    else {
        div.innerHTML = `<i class="far fa-star" onClick="favoriteSelectedNote(${id})"></i>`
    }
    div.innerHTML += `<div class="note-title" onClick="displayNote(${id})">${title}</div>`
    savedNotesDisplay.prepend(div)
}

const addFavoritesNotesIntoDOM = ({ id, title, favorite }) => {
    if (!favorite) return
    const div = document.createElement('div')
    div.classList.add('note')
    div.innerHTML = `<i class="fas fa-star" onClick="favoriteSelectedNote(${id})"></i>`
    div.innerHTML += `<div class="note-title" onClick="displayNote(${id})">${title}</div>`
    savedNotesDisplay.prepend(div)
}

const init = () => {
    savedNotesDisplay.innerHTML = ''
    notes.forEach(addNotesIntoDOM)
}
init()

const downloadFile = (texto, titulo) => {
    const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
    saveAs(blob, titulo + ".txt");
}