import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import terminalIconSrc from '../../assets/terminal.svg';
import WalletConnect from './WalletConnect';

/**
 * Header component with app title and wallet connection
 */
const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" className="terminal-header">
      <Container fluid>        <Navbar.Brand href="#home" className="d-flex align-items-center">
          <img src={terminalIconSrc} width="30" height="30" className="d-inline-block align-top me-2" alt="Terminal Icon" />
          Chronos Protocol
        </Navbar.Brand>
        <WalletConnect />
      </Container>
    </Navbar>
  );
};

export default Header;
