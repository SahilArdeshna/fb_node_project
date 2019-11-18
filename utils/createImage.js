const sharp = require("sharp");

const createImage = async (image, path, width, height, time) => {
  const resizeImage = await sharp(image.buffer)
    .resize(width, height, { fit: sharp.fit.inside, withoutEnlargement: true })
    .toFile(`images/${path}/${time}-${image.originalname}`);

  return resizeImage;
};

const createPostImage = async (file, path, width, time) => {
  const resizeImage = await sharp(file.buffer)
    .resize({ width })
    .toFile(`images/${path}/${time}-${file.originalname}`);

  return resizeImage;
};

module.exports = {
  createImage,
  createPostImage
};
