function serialiseOutput(outputDataSet) {
    var newOutputDataSet = [];
    for (i in outputDataSet) {
        if (outputDataSet[i].includes('\r\n')) {
            var a = outputDataSet[i].split('\r\n');
            if (a[a.length - 1] == '') {
                a.pop();
            }
            newOutputDataSet = newOutputDataSet.concat(a);
        }
        else if (outputDataSet[i].includes('\n')) {
            var a = outputDataSet[i].split('\n')
            if (a[a.length - 1] == '') {
                a.pop();
            }
            newOutputDataSet = newOutputDataSet.concat(a);
        }
        else {
            newOutputDataSet = newOutputDataSet.concat(outputDataSet[i]);
        }
    }
    outputDataSet = null;
    return newOutputDataSet;
}

module.exports = { serialiseOutput };