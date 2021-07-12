import fs from 'fs'

function readFile(filePath, cb) {
    fs.access(filePath, err1 => {
        if (err1) {
            return cb(err1)
        }
        fs.readFile(filePath, 'utf-8', (err2, fileContent) => {
            if (err2) {
                return cb(err2)
            }
            cb(null, fileContent)
        })
    })
}

function concatFiles() {
    const args = Array.from(arguments)

    if (!args.length) {
        throw new Error('Not enough arguments! Expected at least three arguments (callback, dest, srcFile1, srcFile2, ..., srcFilen)')
    }

    const [cb, dest,  ...src] = args
    if (typeof cb !== 'function') {
        throw new Error('Last argument needs to be a function')
    }
    if (typeof dest !== 'string') {
        throw new Error('Before last argument needs to be a string representing destination path')
    }
    if (!src.length) {
        throw new Error('Need at least one source file!')
    }
    if (src.some(source => typeof source !== 'string')) {
        throw new Error('All source files needs to be of type string!')
    }

    let finalText = ''

    function iterate(index) {
        if (index === src.length) {
            return cb(null, finalText, dest)
        }

        readFile(src[index], (err, textContent) => {
            if (err) {
                return cb(err)
            }
            finalText = `${finalText}${textContent}`
            iterate(index + 1)
        })
    }

    readFile(dest, (err, fileContent) => {
        if (err) {
            return cb(err)
        }

        finalText = fileContent

        iterate(0)
    })
}

concatFiles(
    (err, finalText, dest) => {
        if (err) {
            return console.error(err)
        }

        fs.writeFile(dest, finalText, writeErr => {
            if (writeErr) {
                return console.error(writeErr)
            }

            console.log(`${finalText} has been written to ${dest}`)
        })
    },
    './filesToConcat/dest.txt',
    './filesToConcat/foo.txt',
    './filesToConcat/bar.txt',
    './filesToConcat/baz.txt',
)










// import path from 'path'



function concatFilesOld(srcFiles, dest, cb) {
    let finalText = ''

    function iterate(index) {
        if (index === srcFiles.length) {
            return cb(null, finalText)
        }

        readFile(srcFiles[index], (err, data) => {
            if (err) {
                return cb(err)
            }

            // append text to final text
            finalText = `
${finalText}
${data}
`
            iterate(index + 1)
        })
    }

    readFile(dest, (err1, initialText) => {
        if (err1) {
            return cb(err1)
        }

        finalText = initialText

        iterate(0)
    })
}
