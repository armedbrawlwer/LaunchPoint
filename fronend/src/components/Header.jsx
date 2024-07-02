import React,{useEffect} from 'react';
import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { signOutSuccess } from '../app/user/userSlice';
import axios from 'axios';

function Header() {
    const dispatch = useDispatch();
    const { currentUser, loading, error } = useSelector((state) => state.user);

    // useEffect(() => {
    //     if (!currentUser && !loading) {
    //         dispatch(signInStart());
    //     }
    // }, [dispatch, currentUser, loading]);


    async function handleSignout() {
        await axios.post('http://localhost:9000/api/auth/signout').then(res => {
            console.log(res);
            dispatch(signOutSuccess());
        }).catch(e => {
            console.log(e);
        });
    }

    const location = useLocation();
    // const { currentUser } = useSelector((state) => state.user);
    console.log(currentUser);

    return (
        <Navbar className='border-b-2 flex justify-between'>
            <Link to='/' className='self-center text-sm sm:text-lg font-semibold whitespace-nowrap'>
                <span className='px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-cyan-200'>
                    Deploy
                </span>
                Website
            </Link>
            <form className='relative hidden lg:block'>
                <TextInput
                    type='text'
                    placeholder='Search'
                    rightIcon={AiOutlineSearch}
                />
            </form>
            <Button className='w-12 h-10 lg:hidden' color='gray' pill>
                <AiOutlineSearch />
            </Button>
            <div className='flex gap-2 md:order-2'>
                <Button className='w-12 h-10 hidden sm:inline-flex items-center' color='black' pill>
                    <FaMoon />
                </Button>

                {currentUser ? (
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={<Avatar />}
                    >
                        <Dropdown.Header>
                            <span className='block text-sm'>@{currentUser.name}</span>
                        </Dropdown.Header>
                        <Link to={'/dashboard?tab=profile'}>
                            <Dropdown.Item>Profile</Dropdown.Item>
                        </Link>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
                    </Dropdown>
                ) : (
                    <Link to='/signin'>
                        <Button className='bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg'>
                            Sign in
                        </Button>
                    </Link>
                )}

                <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
                <Navbar.Link active={location.pathname === '/'} as='div'>
                    <Link to='/'>Home</Link>
                </Navbar.Link>
                <Navbar.Link active={location.pathname === '/about'} as='div'>
                    <Link to='/about'>About</Link>
                </Navbar.Link>

            </Navbar.Collapse>
        </Navbar >
    );
}

export default Header;
