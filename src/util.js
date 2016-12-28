
const handleDataUploadResponse = (res, destination) => {
  if (!res.ok) {
    console.error(`${res.status} Error sending data to ${destination}`);
    throw new Error(res);
  } else {
    console.log(`Successfully sent data to ${destination}`);
  }
};

module.exports = {
  handleDataUploadResponse
};