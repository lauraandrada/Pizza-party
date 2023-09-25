const {readFile} = require('fs/promises');
const fileReaderAsync = async(filePath) => {
    return await readFile(filePath);
}

module.exports = fileReaderAsync;