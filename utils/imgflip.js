//Tis package is from https://github.com/TomerAberbach/imgflip but don´t know why it is not working
const stream = require('stream');
const fs = require('fs');
const { promisify } = require('util');
const got = require('got');

const pipeline = promisify(stream.pipeline);

class Imgflip {
  constructor({ username, password }) {
    this.username = username;
    this.password = password;
  }

  // https://api.imgflip.com
  async request(path, options) {
    const response = await got(path, {
      prefixUrl: `https://api.imgflip.com`,
      ...options,
    }).json();

    if (response.success === true) {
      return response.data;
    }

    throw new Error(response.error_message);
  }

  async memes() {
    return (await this.request(`get_memes`)).memes;
  }

  async meme(id, { captions, font, maxFontSize, path }) {
    const searchParams = {
      template_id: id,
      username: this.username,
      password: this.password,
      ...Object.assign(
        ...captions.map((caption, i) => ({ [`boxes[${i}][text]`]: caption }))
      ),
    };

    if (font != null) {
      searchParams.font = font;
    }

    if (maxFontSize != null) {
      searchParams.max_font_size = maxFontSize;
    }

    const { url } = await this.request(`caption_image`, {
      method: `POST`,
      searchParams,
    });

    if (path != null) {
      await pipeline(got.stream(url), fs.createWriteStream(path));
    }

    return url;
  }
}

module.exports = Imgflip;
