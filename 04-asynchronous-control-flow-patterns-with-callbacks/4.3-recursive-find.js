import fs from 'fs'
import path from 'path'

const onError = err => console.error(err)

const checkKeywordInFile = (filePath, keyword, matchesCallback) => {
    fs.readFile(filePath, 'utf-8', (fileReadErr, fileContent) => {
        if (fileReadErr) {
            return matchesCallback(fileReadErr)
        }
        if (!fileContent) {
            return matchesCallback(null, false)
        }
        /* const resp = fileContent.split('\n').filter(line => line.includes(keyword))
        if (!resp.length) {
            return matchesCallback(null, false)
        }
        matchesCallback(null, true) */

        return matchesCallback(null, fileContent.includes(keyword))
    })
}

const findFileMatches = (dir, keyword, matches, cb) => {
    fs.readdir(dir, { withFileTypes: true }, (readDirErr, files) => {
        if (readDirErr) {
            return cb(readDirErr)
        }

        let completed = 0

        const { dirFiles, subDirs } = files.reduce((acc, curr) => {
            acc[curr.isFile() ? 'dirFiles' : 'subDirs'].push(curr)
            return acc
        }, { dirFiles: [], subDirs: [] })

        function iterate(index) {
            if (index === subDirs.length) {
                return cb(null, matches)
            }

            const newDirPath = path.join(dir, subDirs[index].name)
            findFileMatches(newDirPath, keyword, matches, () => {
                iterate(index + 1)
            })
        }

        function doneCheck() {
            // when finished searching for a match in the current files continue with the next directory
            if (++completed === dirFiles.length) {
                return iterate(0)
            }
        }

        dirFiles.forEach(file => {
            const filePath = path.join(dir, file.name)

            checkKeywordInFile(filePath, keyword, (_, matching) => {
                if (matching) {
                    matches.push(filePath)
                }
                doneCheck()
            })
        })
    })
}

const recursiveFind = (dirPath, keyword, finalCallback) => {
    findFileMatches(dirPath, keyword, [], (err, matches) => {
        if (err) {
            return onError(err)
        }
        finalCallback(matches)
    })
}

recursiveFind('./filesToConcat', 'batman', console.log)
