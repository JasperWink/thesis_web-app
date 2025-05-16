export const get_API_address = (number) => {
  // API call addresses.
    const API_dict = {
        0 : 'http://localhost:8094/',    // Localhost
        1 : 'http://146.50.56.13:8094',  // Chimai
        2 : 'http://145.100.134.14:8094' // GPU server
    }
  return API_dict[number];
}
