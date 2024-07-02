import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';

function HomePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Welcome to the Deploy Website</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/create-project">
                    <Button className='w-full py-6 text-xl bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg'>
                        Create Project
                    </Button>
                </Link>
                
                <Link to="/view-deployed-projects">
                    <Button className='w-full py-6 text-xl bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg'>
                        View Deployed Projects
                    </Button>
                </Link>
                <Link to="/view-all-projects">
                    <Button className='w-full py-6 text-xl bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg'>
                        View All Projects and Their Deployments
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;
