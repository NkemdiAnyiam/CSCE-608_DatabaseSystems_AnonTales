import React, { useContext, useEffect, useState } from 'react'; // ES6 js
import {Link, useHistory} from 'react-router-dom';

import SerialNoContext from '../contexts/SerialNoContext';
import Logo from './Logo';

function Nav() {
    const mySerialNo = useContext(SerialNoContext);
    const history = useHistory();
    const [currentPath, setCurrentPath] = useState(history.location.pathname);

    useEffect(() => {
        setCurrentPath(history.location.pathname);
        history.listen(({pathname}) => {
        setCurrentPath(pathname);
       }) 
    }, []);

    const onAddUser = async () => {
        fetch('/addUser', {method: 'POST'})
        .then(async res => {
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err);
            }

            alert('Welcome to Anon Tales, stranger!');
            history.go(0);
        })
        .catch(err => alert(err));
    }

    const onDeleteUser = async () => {
        fetch('/deleteUser', {method: 'DELETE'})
        .then(async res => {
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err);
            }

            alert('It was nice not knowing you—come back soon!');
            history.go(0);
        })
        .catch(err => alert(err));
    }

    const renderUserButton = () => {
        return (
            !mySerialNo ?
            <button className={`button button--green`} onClick={onAddUser}>
                Join Anon Tales
            </button> :
            <button className={`button button--red`} onClick={onDeleteUser}>
                Leave Anon Tales
            </button>
        );
    }

    return(
        <nav className="nav navbar navbar-expand-lg navbar-dark bg-dark top">
            <Link to='/' className="nav__logo"><Logo /> Anon Tales</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navMainMenu" aria-controls="navMainMenu" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div id="navMainMenu" className="navbar-collapse collapse">
                <div className="nav__links navbar-nav ml-auto">
                    <Link to='/' className={`nav__link nav-item nav-link ${currentPath === '/' ? 'active' : ''}`}>Home</Link>
                    <Link to='/my-stories' className={`nav__link nav-item nav-link ${currentPath?.startsWith?.('/my-stories') ? 'active' : ''}`}>My Stories</Link>
                    <Link to='/my-prompts' className={`nav__link nav-item nav-link ${currentPath?.startsWith?.('/my-prompts') ? 'active' : ''}`}>My Prompts</Link>
                    <Link to='/stories' className={`nav__link nav-item nav-link ${currentPath?.startsWith?.('/stories') ? 'active' : ''}`}>Stories</Link>
                    <Link to='/prompts' className={`nav__link nav-item nav-link ${currentPath?.startsWith?.('/prompts') ? 'active' : ''}`}>Prompts</Link>
                    {renderUserButton()}
                </div>
            </div>
        </nav>
    );
}

export default Nav;
