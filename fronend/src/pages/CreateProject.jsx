import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label, TextInput, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateProject() {
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user); // Assuming token is in state.user
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    // Handle form input changes
    function changeHandler(e) {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();

        try {
            console.log(formData);
            const res = await axios.post('http://localhost:9000/api/service/createProject', {
                name: formData.name,
                gitURL: formData.gitURL,
                user: currentUser
            });
            const data = await res.json();
            // console.log(res);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='max-w-3xl mx-auto mt-5'>
            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                <div>
                    <Label value='Name of Project' />
                    <TextInput
                        type='text'
                        placeholder='Enter name'
                        id='name'
                        onChange={changeHandler}
                    />
                </div>

                <div>
                    <Label value='Enter Git URL of Project' />
                    <TextInput
                        type='text'
                        placeholder='Enter gitUrl'
                        id='gitURL'
                        onChange={changeHandler}
                    />
                </div>

                <Button
                    gradientDuoTone='purpleToPink'
                    disabled={loading}
                    type='submit'
                >
                    {loading ? 'Loading...' : 'Create Project'}
                </Button>
            </form>
        </div>
    );
}

export default CreateProject;
