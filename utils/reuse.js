function serialiseOutput(outputDataSet) {
    console.log(outputDataSet);
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

let o = ["5","","1 0","","2 1","3 2","","4 3","","5 4"]
let O = ["5","","1 0","","2 1","3 2","4 3","5 4"]

module.exports = { serialiseOutput };