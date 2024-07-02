import React, { useState } from 'react'
import { Button, Label, TextInput, Alert } from 'flowbite-react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Signup() {

    const [formdata, setFormData] = useState({})
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()

    function changeHandler(e) {
        setFormData({ ...formdata, [e.target.id]: e.target.value })
        console.log(formdata)
    }

    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await axios.post('http://localhost:9000/api/auth/signup', {
                username: formdata.username,
                password: formdata.password
            })
            console.log(res);
            navigate('/signin')
        } catch (e) {
            setErrorMessage(e.response.data.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen mt-20'>
            <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center'>
                <div className=' flex-1'>
                    <Link to='/' className=' text-4xl  font-semibold' >
                        <span className='px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-cyan-200'>
                            Deploy
                        </span>
                        Website
                    </Link>
                    <p className='text-sm mt-5'>This is a demo project you can sign up with your email or
                        password
                        or with google
                    </p>
                </div>

                <div className='flex-1'>
                    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                        <div>
                            <Label value='Your Username' />
                            <TextInput
                                type='text'
                                placeholder='Enter name'
                                onChange={changeHandler}
                                id='username'
                            />
                        </div>

                        <div>
                            <Label value='Your Password' />
                            <TextInput
                                type='password'
                                placeholder='Enter password'
                                id="password"
                                onChange={changeHandler}
                            />
                        </div>

                        <Button gradientDuoTone='purpleToPink'
                            disabled={loading}
                            type='submit'
                        >{loading ? (<>
                            <p>Loading...</p>
                        </>) : ('Sign Up')}
                        </Button>
                    </form>
                    <div className='flex gap-3 text-sm mt-3'>
                        <span>Have an account?</span>
                        <Link to='/signin' className='text-blue-300'>
                            Sign In
                        </Link>
                    </div>
                    {errorMessage && (
                        <Alert className='mt-5' color='failure'
                        >{errorMessage}</Alert>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Signup
