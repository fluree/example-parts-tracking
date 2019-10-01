## Fluree Airline Demo

This repo contains a large database of the simulated flights and repairs for 101 planes over the course of a month. It also contains a lightweight React UI that makes it easy to take a slice of the data - in order to see the history of a plane, the history of an airport, and verify if a part is signed by a manufacturer. 


### Start Up

Make sure that you have an empty Fluree database, version 0.10.3 and up. Copy the 'data' folder and the 'default_private_key.txt' file into that Fluree database. You can start up the database by navigating the directory and running `./fluree_start.sh`. If you haven't changed the api port, there will be a user interface for querying and transacting against the database available on localhost:8080.

To initiate the React application, navigate into the airplane-parts folder, run `npm install` and then `npm start`.

Enjoy exploring!

Note that the part verification component is currently stubbed out. When we publish our more robust cryptography library, we will be updating this component. 
