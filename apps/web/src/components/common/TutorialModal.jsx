import React, { useState } from 'react';
import { Modal, Button, Accordion, Card, ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Tutorial Modal component that explains how to use the Chronos Protocol application
 */
const TutorialModal = ({ show, onHide }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="tutorial-modal"
      centered
      className="tutorial-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="tutorial-modal">
          Welcome to Chronos Protocol
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light">
        {/* Progress indicator */}
        <div className="progress mb-4">
          <div 
            className="progress-bar bg-success" 
            role="progressbar" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
            aria-valuenow={(step / totalSteps) * 100} 
            aria-valuemin="0" 
            aria-valuemax="100"
          >
            Step {step} of {totalSteps}
          </div>
        </div>

        {/* Step 1: Introduction */}
        {step === 1 && (
          <div className="tutorial-step">
            <h3>What is Chronos Protocol?</h3>
            <div className="d-flex align-items-center mb-4">
              <div className="flex-shrink-0">
                <img src="/chronos-logo.svg" alt="Chronos Logo" width="80" height="80" className="me-3" />
              </div>
              <div>
                <p className="mb-0">
                  <strong>Chronos Protocol</strong> is a decentralized application (DApp) that allows you to create 
                  time-based commitments and agreements on the blockchain. These commitments are enforceable 
                  through smart contracts, making them trustless and transparent.
                </p>
              </div>
            </div>

            <h4>Key Features:</h4>
            <ListGroup className="mb-3">
              <ListGroup.Item>Create time-bound agreements with anyone</ListGroup.Item>
              <ListGroup.Item>Set deadlines and financial incentives</ListGroup.Item>
              <ListGroup.Item>Track agreement status and completion</ListGroup.Item>
              <ListGroup.Item>All secured by blockchain technology</ListGroup.Item>
            </ListGroup>

            <div className="alert alert-info">
              <strong>Note:</strong> This application runs on Base Sepolia testnet, which means you'll need Base Sepolia ETH (not real money) to use it.
            </div>
          </div>
        )}

        {/* Step 2: Getting Started */}
        {step === 2 && (
          <div className="tutorial-step">
            <h3>Getting Started</h3>

            <Accordion defaultActiveKey="0" className="mb-4">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <strong>1. Connect Your Wallet</strong>
                </Accordion.Header>
                <Accordion.Body>
                  <p>To interact with the Chronos Protocol, you first need to connect a blockchain wallet:</p>
                  <ol>
                    <li>Click the <strong>"Connect Wallet"</strong> button in the top right corner</li>
                    <li>Select your preferred wallet (MetaMask is recommended)</li>
                    <li>Approve the connection request in your wallet</li>
                  </ol>
                  <div className="text-center my-3">
                    <img src="/tutorial/connect-wallet.png" alt="Connect Wallet Illustration" className="tutorial-image img-fluid border rounded" style={{ maxHeight: "200px" }} />
                  </div>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header>
                  <strong>2. Switch to Base Sepolia Network</strong>
                </Accordion.Header>
                <Accordion.Body>
                  <p>The app will check if you're on the Base Sepolia testnet:</p>
                  <ul>
                    <li>If not, you'll see a warning banner</li>
                    <li>Click the <strong>"Switch to Base Sepolia"</strong> button</li>
                    <li>Approve the network switch in your wallet</li>
                  </ul>
                  <div className="alert alert-warning">
                    If you don't see the network in your wallet, you may need to add it manually using Chain ID: 84532
                  </div>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2">
                <Accordion.Header>
                  <strong>3. Get Test ETH</strong>
                </Accordion.Header>
                <Accordion.Body>
                  <p>You'll need Base Sepolia ETH to pay for transaction fees:</p>
                  <ol>
                    <li>Click the <strong>"Get Base Sepolia ETH"</strong> button</li>
                    <li>Follow the instructions on the faucet website</li>
                    <li>Wait for the test ETH to be sent to your wallet</li>
                  </ol>
                  <p>This is free testnet ETH with no real-world value.</p>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <div className="alert alert-success">
              Once connected to Base Sepolia with some test ETH, you're ready to use the application!
            </div>
          </div>
        )}

        {/* Step 3: Creating Agreements */}
        {step === 3 && (
          <div className="tutorial-step">
            <h3>Creating Time-Based Agreements</h3>
            
            <Card className="mb-4">
              <Card.Body>                <h5>Using the Command Format</h5>
                <p>Create agreements using the chat command:</p>
                
                <div className="bg-dark text-light p-3 rounded mb-3 font-monospace">
                  /task @0xWalletAddress Description by YYYY-MM-DD HH:MM for 0.1 ETH
                </div>
                
                <p><strong>Example:</strong></p>
                <div className="bg-dark text-light p-3 rounded mb-3 font-monospace">
                  /task @0x1234abcd... Deliver project mockups by 2025-07-01 18:00 for 0.5 ETH
                </div>
                
                <div className="alert alert-info">
                  <strong>Real Example:</strong><br/>
                  <code>/task @0x7F397AEf6B15b292f3Bcc95547Ea12EfB3572C94 Complete website redesign by 2025-08-15 14:30 for 0.2 ETH</code><br/>
                  <small>Copy this example and paste it in the chat to try it out (replace with an actual wallet address)</small>
                </div>

                <h6>Command Breakdown:</h6>
                <ul>
                  <li><code>/task</code> - Initiates a new agreement</li>
                  <li><code>@0x...</code> - Ethereum address of the counterparty</li>
                  <li><code>Description</code> - What needs to be done</li>
                  <li><code>by YYYY-MM-DD HH:MM</code> - Deadline date and time</li>
                  <li><code>for X ETH</code> - Payment amount in ETH</li>
                </ul>
              </Card.Body>
            </Card>

            <div className="mb-4">
              <h5>After Creating an Agreement:</h5>
              <ol>
                <li>Sign the transaction in your wallet</li>
                <li>Pay the gas fee (using your test ETH)</li>
                <li>Wait for blockchain confirmation</li>
                <li>The agreement card will appear in your chat</li>
              </ol>
            </div>              <div className="alert alert-info">
                <strong>Note:</strong> All agreements are recorded on the blockchain and cannot be modified after creation.
              </div>
              
              <div className="card bg-light border-primary mb-3">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">Using the Chat Input</h5>
                </div>
                <div className="card-body">
                  <ol>
                    <li>Look for the input field at the bottom of the chat window</li>
                    <li>Type your regular message or a <code>/task</code> command</li>
                    <li>For regular chat messages, just type and press "Send"</li>
                    <li>For tasks, follow the exact format described above</li>
                    <li>Any syntax errors in your task command will show an error notification</li>
                  </ol>
                  <img src="/tutorial/chat-input.svg" alt="Chat Input Example" className="img-fluid border rounded" />
                </div>
              </div>
          </div>
        )}

        {/* Step 4: Managing Agreements */}
        {step === 4 && (
          <div className="tutorial-step">
            <h3>Managing Your Agreements</h3>

            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-primary text-white">
                    As a Requester
                  </div>
                  <div className="card-body">
                    <h5>When you create a task:</h5>
                    <ul>
                      <li>You'll see it as "Pending"</li>
                      <li>You can cancel it before it's accepted</li>
                      <li>You deposit the ETH as collateral</li>
                      <li>You can mark it as "Completed" when done</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-success text-white">
                    As a Performer
                  </div>
                  <div className="card-body">
                    <h5>When someone assigns you a task:</h5>
                    <ul>
                      <li>You'll receive a notification</li>
                      <li>You can accept or decline it</li>
                      <li>Once accepted, you must complete before deadline</li>
                      <li>You'll receive payment on completion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <h5>Understanding Agreement States:</h5>
            <ListGroup className="mb-4">
              <ListGroup.Item variant="light"><strong>Pending</strong> - Created but not yet accepted</ListGroup.Item>
              <ListGroup.Item variant="info"><strong>Active</strong> - Accepted and in progress</ListGroup.Item>
              <ListGroup.Item variant="success"><strong>Completed</strong> - Marked as done and paid out</ListGroup.Item>
              <ListGroup.Item variant="danger"><strong>Expired</strong> - Deadline passed without completion</ListGroup.Item>
              <ListGroup.Item variant="secondary"><strong>Cancelled</strong> - Cancelled by requester before acceptance</ListGroup.Item>
            </ListGroup>

            <div className="alert alert-warning">
              <strong>Important:</strong> If a deadline passes without completion, the contract will be marked as expired and funds returned to the requester.
            </div>
          </div>
        )}

        {/* Step 5: Troubleshooting */}
        {step === 5 && (
          <div className="tutorial-step">
            <h3>Troubleshooting & Advanced Features</h3>
            
            <h5 className="mt-4">Common Issues:</h5>
            <Accordion className="mb-4">              <Accordion.Item eventKey="0">
                <Accordion.Header>Task Command Errors</Accordion.Header>
                <Accordion.Body>
                  <p><strong>Common syntax errors:</strong></p>
                  <ul>
                    <li>Invalid Ethereum address format (must start with 0x followed by 40 hex characters)</li>
                    <li>Incorrect date format (must be YYYY-MM-DD HH:MM)</li>
                    <li>Missing "by" or "for" keywords in the command</li>
                    <li>Setting a deadline that's in the past</li>
                    <li>Using a token other than ETH (currently only ETH is supported)</li>
                  </ul>
                  <p><strong>Solutions:</strong></p>
                  <ul>
                    <li>Double-check the address format</li>
                    <li>Ensure the date is in the future and formatted correctly</li>
                    <li>Follow the exact command structure: <code>/task @0x... Description by YYYY-MM-DD HH:MM for 0.1 ETH</code></li>
                    <li>If in doubt, copy the example from the tutorial and modify it</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
              
              <Accordion.Item eventKey="1">
                <Accordion.Header>Transaction Failing</Accordion.Header>
                <Accordion.Body>
                  <p><strong>Possible causes:</strong></p>
                  <ul>
                    <li>Insufficient ETH for gas fees</li>
                    <li>Network congestion</li>
                    <li>Wallet configuration issues</li>
                  </ul>
                  <p><strong>Solutions:</strong></p>
                  <ul>
                    <li>Get more testnet ETH from the faucet</li>
                    <li>Try again with a higher gas price</li>
                    <li>Check your wallet connection</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
                <Accordion.Item eventKey="2">
                <Accordion.Header>Network Connection Issues</Accordion.Header>
                <Accordion.Body>
                  <p><strong>If you see "Switch to Base Sepolia" even after switching:</strong></p>
                  <ol>
                    <li>Click "Show Network Details" in the Base Sepolia banner</li>
                    <li>Run the Alchemy Connection Tester</li>
                    <li>Check if your wallet shows the correct network</li>
                    <li>Try disconnecting and reconnecting your wallet</li>
                  </ol>
                </Accordion.Body>
              </Accordion.Item>
              
              <Accordion.Item eventKey="3">
                <Accordion.Header>Missing Agreements</Accordion.Header>
                <Accordion.Body>
                  <p>If you don't see your agreements:</p>
                  <ul>
                    <li>Make sure you're connected with the same wallet address</li>
                    <li>Check if the backend server is running</li>
                    <li>Wait a few moments for blockchain confirmations</li>
                    <li>Try refreshing the page</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <h5>Additional Resources:</h5>
            <Card className="mb-3">
              <ListGroup variant="flush">
                <ListGroup.Item action href="https://sepolia.basescan.org" target="_blank">
                  Base Sepolia Block Explorer
                </ListGroup.Item>
                <ListGroup.Item action href="https://faucet.base.org" target="_blank">
                  Base Sepolia Faucet
                </ListGroup.Item>
                <ListGroup.Item action href="https://docs.base.org" target="_blank">
                  Base Documentation
                </ListGroup.Item>
              </ListGroup>
            </Card>

            <div className="alert alert-success">
              <h5 className="alert-heading">Ready to get started!</h5>
              <p className="mb-0">You now know the basics of using the Chronos Protocol. Click "Finish Tutorial" to start creating time-based agreements on the blockchain!</p>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex w-100 justify-content-between">
          <Button variant="secondary" onClick={prevStep} disabled={step === 1}>
            Previous
          </Button>
          <div>
            {step < totalSteps ? (
              <Button variant="primary" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button variant="success" onClick={onHide}>
                Finish Tutorial
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

TutorialModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired
};

export default TutorialModal;
