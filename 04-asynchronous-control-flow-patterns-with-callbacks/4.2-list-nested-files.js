import fs from 'fs'
import path from 'path'

const onError = err => console.error(err)

const readDir = (currentFilePath, allFiles, done) => {
    fs.readdir(currentFilePath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return done(err)
        }

        const { realFiles, realDirs } = files.reduce((acc, curr) => {
            acc[curr.isFile() ? 'realFiles' : 'realDirs'].push(curr)
            return acc
        }, { realFiles: allFiles, realDirs: [] })

        function iterate(index) {
            if (index == realDirs.length) {
                return process.nextTick(() => {
                    done(null, realFiles.map(f => f.name))
                })
            }

            const newDir = realDirs[index]
            const newDirPath = path.join(currentFilePath, newDir.name)

            readDir(newDirPath, realFiles, () => {
                iterate(index + 1)
            })
        }

        iterate(0)
    })
}

const listNestedFile = (dirPath, finalCallback) => {
    readDir(dirPath, [], (err, allFiles) => {
        if (err) {
            return onError(err)
        }
        finalCallback(allFiles)
    })

}

listNestedFile('./filesToConcat', console.log)
