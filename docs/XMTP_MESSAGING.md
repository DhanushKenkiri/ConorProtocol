# XMTP Messaging Integration for Chronos Protocol

## Overview
This integration adds wallet-to-wallet messaging capabilities to the Chronos Protocol using the XMTP (Extensible Message Transport Protocol) SDK. XMTP allows secure, decentralized messaging between Ethereum addresses.

## Features
- Send and receive messages from any Ethereum wallet address
- Real-time message updates
- Persistent message storage
- Encryption by default

## Components
1. **XmtpService**: Core service that handles XMTP client initialization and message operations
2. **useXmtpMessaging**: React hook for easy integration of XMTP in components
3. **XmtpMessenger**: UI component for sending and receiving messages

## Usage

### Command-based messaging
You can use the following command in the chat input:
```
/message @0x123...abc
```
This will open a messaging interface to communicate with the specified wallet address.

### Messenger UI
Click the "Open Messenger" button in the Wallet-to-Wallet Messaging card to open the messaging interface. You can then enter a recipient address to start a conversation.

### Requirements
- A connected wallet is required to use the messaging features
- The recipient wallet must also have XMTP enabled to receive messages

## Security Considerations
- All messages are encrypted by default
- Messages are stored on XMTP's production network
- Only the sender and recipient can decrypt the messages

## Dependencies
- @xmtp/xmtp-js: Core XMTP SDK
- buffer: Required for handling binary data in the browser
