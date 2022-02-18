function serialiseOutput(outputDataSet) {
    newOutputDataSet = [];
    for (i in outputDataSet) {
        if (outputDataSet[i].includes('\r\n')) {
            newOutputDataSet = newOutputDataSet.concat(outputDataSet[i].split('\r\n'));
        }
        else if (outputDataSet[i].includes('\n')) {
            newOutputDataSet = newOutputDataSet.concat(outputDataSet[i].split('\n'));
        }
        else {
            newOutputDataSet = newOutputDataSet.concat(outputDataSet[i]);
        }
    }
    outputDataSet = null;

    if (newOutputDataSet[newOutputDataSet.length - 1] == '') {
        newOutputDataSet.pop();
    }

    return newOutputDataSet;
}

module.exports = {serialiseOutput};