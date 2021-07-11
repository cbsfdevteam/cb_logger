export function calculateNumOfPages(numOfRowsTotal, numOfRowsShown) {
    let pagenumbers = parseInt(numOfRowsTotal / numOfRowsShown);
    let Pages = 0;
    let n = numOfRowsTotal % numOfRowsShown;
    if (n > 0) {
        Pages = pagenumbers + 1
    } else if (pagenumbers == 0) {
        Pages = 1;
    } else {
        Pages = pagenumbers;
    }
    return Pages;
}

//TODO
export function cutRows2sets(numOfRowsTotal, numOfRowsShown) {

}
//TODO
export function showRecordFrom(){

}