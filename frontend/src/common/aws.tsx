export const uploadImage = async (image: File) => {
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const data = await response.json();
  return data.url;
};
//sao r cưng
