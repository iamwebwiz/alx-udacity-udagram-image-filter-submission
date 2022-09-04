import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles, isValidUrl } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.get("/filteredimage", async (req, res, next) => {
    const { image_url } = req.query;

    if (!image_url) {
      res
        .status(404)
        .send(
          "The query parameter [image_url] must be supplied. Append <kbd>?image_url={{url_of_image}}</kbd> to the URL."
        );
    }

    if (!!image_url && !isValidUrl(image_url)) {
      res.status(422).send("please use a valid url");
    }

    let imagePath: string;

    try {
      imagePath = await filterImageFromURL(image_url);
    } catch (err) {
      console.error(`Image is unable to load due to this error: ${err}`);
      return res
        .status(500)
        .send(
          "The image resource you are trying to load is not accessible. Please check the URL again or try another one."
        );
    }

    res.sendFile(imagePath, (err) => {
      if (err)
        console.error(
          `Unable to show filtered image due to this error: ${err}`
        );
      deleteLocalFiles([imagePath]);
    });
  });

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send(
      "Nothing much happens here. Try sending a GET request to <kbd>/filteredimage?image_url={{}}</kbd>"
    );
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
