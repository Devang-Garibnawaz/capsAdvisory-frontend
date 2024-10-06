export const formatExpiryDate = (dateStr:string) => {
    const months:any = {
      "Jan": "JAN",
      "Feb": "FEB",
      "Mar": "MAR",
      "Apr": "APR",
      "May": "MAY",
      "Jun": "JUN",
      "Jul": "JUL",
      "Aug": "AUG",
      "Sep": "SEP",
      "Oct": "OCT",
      "Nov": "NOV",
      "Dec": "DEC"
    };
  
    const [day, month, year] = dateStr.split('-');
    const shortYear = year.slice(2); // Get last two digits of the year
    return `${day}${months[month]}${shortYear}`;
  };


  export const formatDate = (isoString:string) => {
    const date = new Date(isoString);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const year = date.getFullYear();
    
    return `${year}-${month}-${day}`;
  };

  export const formatTime = (isoString:string, isTime=false) => {
    const date = new Date(isoString);
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
        
    return `${hours}:${minutes}`;
    
  };
  
  