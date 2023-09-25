const {writeFile} = require('fs/promises');

const fileWriterAsync = async(path, newData) => {
    return await writeFile(path, newData);
}

module.exports = fileWriterAsync;