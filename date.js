
//getting current date and exporting to the app.js
module.exports.getDate = ()=>{
  const options = {year: 'numeric', month: 'long', day: 'numeric'};
  const today  = new Date();

  return today.toLocaleDateString("en-US", options);
}


//getting current year and exporting to the app.js
module.exports.getYear = ()=>{
  const options = {year: 'numeric'};
  const year  = new Date();
  return year.toLocaleDateString("en-US", options);

}
