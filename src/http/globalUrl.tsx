
export const getBaseUrl = () => {
    let url;
    switch(process.env.NODE_ENV) {
      case 'production':
        url = 'http://93.188.167.217/api/';
        break;
      case 'development':
      default:
        url = 'http://localhost:8080/api/';
    }
  
    return url;
  }
  