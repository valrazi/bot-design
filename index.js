import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';
import express from "express";


const app = express();


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    auth: {
        persistSession: false
    }
})

app.use(express.json())

var isLoggedIn = async (req, res, next) => {
    const session = await supabase.auth.getSession()
    if(session.data.session != null){
        next()
    } else{
        return res.status(401).json({"message":"unauthorized"})
    }
}

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server run on port ${process.env.PORT}`);
})


//REGISTER user
app.post('/register', async(req, res) => {
    try {
        const { error } = await supabase.auth.signUp({
            email: req.body.email,
            password: req.body.password,
          })

          if(error){
            return res.status(401).json({message: error})
          }
        return res.status(200).json({message: "please check your email box to verify your email address!"})
       
    } catch (error) {
        return res.status(400).json({message: error})
    }
})


//LOGIN User
app.post('/login', async(req, res) => {
    try {
        const {error} =  await supabase.auth.signInWithPassword({
            email: req.body.email,
            password: req.body.password
        })
        
        if(error) {
            res.status(501).json({"message": error})
        }
        
        return res.status(200).json({"message":"sucessfully login"})
    } catch (error) {
        res.status(400).json(error)
    }
})


//GET All Project
app.get('/projects', isLoggedIn,async(req, res) => {
    try {
        const {data: {user: {id}}} = await supabase.auth.getUser()
        const {data, error} = await supabase.from('projects').select().eq('user', id);

        if(error){
            return res.status(400).json(error)
        }
        return res.status(200).json(data)
    } catch (error) {
        return res.status(400).json(error)
    }
})

//GET Project by ID
app.get('/projects/:id', isLoggedIn,async(req, res) => {
    try {
        const {data, error} = await supabase.from('projects').select().eq('id', req.params.id);
        
        if(error) {
            return res.status(400).json(error)
        }

        return res.send(data[0])
    } catch (error) {
        return res.send(error)
    }
})

//ADD New Project
app.post('/projects', isLoggedIn,async(req, res) => {
    try {
        const {data: {user: {id}}} = await supabase.auth.getUser()

        const newData = {
            user: id,
            name: req.body.name
        }
        const {error} = await supabase.from('projects').insert(newData)
        if(error) {
                return res.status(400).json(error)
        }

        res.status(200).redirect('/projects')
    } catch (error) {
        return res.send(error)
    }
})

//UPDATE Project Name by ID
app.put('/projects/:id', isLoggedIn,async(req, res) => {
    try {
        const {error} = await supabase.from('projects').update({name: req.body.name}).eq('id', req.params.id)
        if(error) {
            return res.status(400).json(error)
        }
        const {data, errSelect} = await supabase.from('projects').select().eq('id', req.params.id)
        if(errSelect){
            return res.status(400).json(error)
        }

        return res.status(200).json(data[0])
    } catch (error) {
        return res.send(error)
    }
})

//DELETE Project by ID
app.delete('/projects/:id', isLoggedIn,async(req, res) => {
    try {
        const {errorDelete} = await supabase.from('projects').delete().eq('id', req.params.id)
        
        if(errorDelete){
            return res.status(400).json({"message": errorDelete})
        }

        const {data: {user: {id}}} = await supabase.auth.getUser()


        const {data, errorSelect} = await supabase.from('projects').select().eq('user', id);
        
        if(errorSelect){
            return res.status(400).json({"message": errorSelect})
        }

        return res.status(200).json(data)

    } catch (error) {
        return res.send(error)
    }
})

//UPDATE Chat Project
//Modified Chat Project by Project ID
app.post('/projects/chat/:id', isLoggedIn,async(req, res) => {
    try {
        const {error} = await supabase.from('projects').update({designs: req.body.designs}).eq('id', req.params.id)
        if(error) {
            return res.status(400).json(error)
        }


        const {data, errSelect} = await supabase.from('projects').select().eq('id', req.params.id)
        if(errSelect) {
            return res.status(400).json(errSelect)
        }
        
        return res.status(200).json(data[0])
    } catch (error) {
        return res.send(error)
    }
})


//Modified Chat Project by Project ID
app.put('/projects/chat/:id', isLoggedIn,async(req, res) => {
    try {
        const arrData = []
        const {data} = await supabase.from('projects').select().eq('id', req.params.id)
        data[0].designs.forEach(el => arrData.push(el))
        
        const requestBody = req.body.designs;
        requestBody.forEach(el => arrData.push(el))
        
        const {error} = await supabase.from('projects').update({designs: arrData}).eq('id', req.params.id);
        if(error){
            return res.status(400).json(error)
        }

        const updatedData = await supabase.from('projects').select().eq('id', req.params.id)
        return res.status(200).json(updatedData.data)
    } catch (error) {
        return res.send(error)
    }
})

// //REMOVE Chat Project by Project ID
// app.delete('/projects/chat/:idproject/:idchat', async(req, res) => {
//     try {
//         const arrData = []
//         const {data} = await supabase.from('projects').select().eq('id', req.params.idproject)
//         data[0].designs.forEach(el => arrData.push(el))
        
//         const dataDelete = arrData.filter(el => el.id === 1)
//         console.log(dataDelete);

//         return res.status(200)
//     } catch (error) {
//         return res.send(error)
//     }
// })




