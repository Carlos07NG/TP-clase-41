const path = require("path");
const db = require("../../database/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require("moment");
const createError = require('http-errors')
//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;

const modelResponseMovie = {
    attributes : {
      exclude : ['genre_id','created_at','updated_at']
    },
    include: [
      {
        association : 'genre',
        attributes : ['name','ranking']
      }
    ],
}

const moviesController = {
  list: async (req, res) => {
    try {

      const movies = await db.Movie.findAll( modelResponseMovie)

      // const moviesWithUrl = movies.map.findAll(movies => {
      //   return {
      //     ...movies.dataValue,
      //     URL : `${req.protocol}://${}`
      //   }
      // });
        return res.status(200).json({
          ok: true,
          meta: {
            status: 200,
            total: movies.length,
            url: `${req.protocol}://${req.get("host")}/apis/movies`,
          },
          data: movies,
        });
    }catch (error){
      return res.status(error.status || 500).json({
        ok : false,
        msg : error.message || 'Ups, hubo un Error.Llamar a Eric'
      })
    }
  },
  detail: async (req, res) => {
    try {

      if(isNaN(req.params.id)) throw createError(404, ("ID invalido"))

      const movie = await db.Movie.findByPk(req.params.id, modelResponseMovie)
      
      if(!movie) throw createError(404, ("No hay pelicula con ese ID"))

      return res.status(200).json({
        ok: true,
        meta: {
          status: 200,
          url: `${req.protocol}://${req.get("host")}/apis/movies/${'movie.id'}`,
        },
        data: movie,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        ok : false,
        msg : error.message || 'Ups, hubo un Error.Llamar a Eric'
      })
    }
  },
  newest: async (req, res) => {
    try {
      const movies = await db.Movie.findAll({
        order: [["release_date", "DESC"]],
        limit: 5,
        ...modelResponseMovie
      })
      return res.status(200).json({
        ok: true,
        meta: {
          status: 200,
          total: movies.length,
          url: `${req.protocol}://${req.get("host")}/apis/movies/new`,
        },
        data: movies,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        ok : false,
        msg : error.message || 'Ups, hubo un Error.Llamar a Eric'
      })
    }
  },
  recomended: async (req, res) => {
    try {
      const movies = await db.Movie.findAll({
        where: {
          rating: { [db.Sequelize.Op.gte]: 8 },
        },
        order: [["rating", "DESC"]],
        ...modelResponseMovie
      })
      return res.status(200).json({
        ok: true,
        meta: {
          status: 200,
          total: movies.length,
          url: `${req.protocol}://${req.get("host")}/apis/movies/recommended`,
        },
        data: movies,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        ok : false,
        msg : error.message || 'Ups, hubo un Error.Llamar a Eric'
      })
    }

  },
  //Aqui dispongo las rutas para trabajar con el CRUD
  create: async function (req, res) {
    try {

      const {title,rating,awards,release_date,genre_id,length} = req.body 

      if([title, rating, awards, release_date, genre_id, length].includes("" || undefined)) throw createError(400,"Todos los campos son obligatorios")
      
      const newMovie = await Movies.create({
        title,
        rating,
        awards,
        release_date,
        length,
        genre_id,
      })

      const movie = await Movies.findByPk(newMovie.id,modelResponseMovie)
      return res.status(200).json({
        ok: true,
        meta: {
          status: 201,
          url: `${req.protocol}://${req.get("host")}/apis/movies/${newMovie.id}`,
        },
        data: movie,
        msg : "Pelicula creada con exito"
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        ok : false,
        msg : error.message || 'Ups, hubo un Error.Llamar a Eric'
      })
    }
  },
  update: async function (req, res) {
    try {
      const {title,rating,awards,release_date,genre_id,length} = req.body 

      if([title, rating, awards, release_date, genre_id, length].includes("" || undefined)) throw new Error("Todos los campos son obligatorios")
      if(isNaN(req.params.id)) throw createError(404, ("ID invalido"))
      
      const movie = await db.Movie.findByPk(req.params.id, modelResponseMovie)
      if(!movie) throw createError(404, ("No hay pelicula con ese ID"))

      movie.title = title?.trim() || movie.title;
      movie.rating = rating || movie.rating
      movie.awards = awards  || movie.awards
      movie.release_date =release_date || movie.releaserelease_date
      movie.length = length || movie.length
      movie.genre_id = genre_id || movie.genre_id

      movie.save();
      return res.status(200).json({
        ok: true,
        meta: {
          status: 201,
          url: `${req.protocol}://${req.get("host")}/apis/movies/${movie.id}`,
        },
        data: movie,
        msg : "Pelicula actualizada con exito"
      });
     
    } catch (error) {
      return res.status(error.status || 500).json({
        ok : false,
        msg : error.message || 'Ups, hubo un Error.Llamar a Eric'
      })
    }
  },
  destroy: async function (req, res) {
    try {

      if(isNaN(req.params.id)) throw createError(404, ("ID invalido"))

      Movies.destroy({ where: { id: req.params.id }, force: true }) // force: true es para asegurar que se ejecute la acción
      
      return res.status(200).json({
        ok: true,
        meta: {
          status: 200,        
        },
        data: null,
        msg : "Pelicula eliminada con exito"
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        ok : false,
        msg : error.message || 'Ups, hubo un Error.Llamar a Eric'
      })
    }
    
  },
};

module.exports = moviesController;
