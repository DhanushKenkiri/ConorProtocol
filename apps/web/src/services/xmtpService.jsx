// XMTP service for wallet-to-wallet messaging
import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';

/**
 * XMTPService manages connections and messaging using the XMTP protocol
 * for wallet-to-wallet communication in the Chronos Protocol
 */
class XMTPService {
  constructor() {
    this.client = null;
    this.conversations = [];
    this.isInitialized = false;
  }

  /**
   * Initialize the XMTP client with a wallet signer
   * @param {object} signer - ethers.js signer from connected wallet
   * @returns {Promise<boolean>} - Success status
   */
  async init(signer) {
    if (!signer) {
      console.error('Cannot initialize XMTP client: No signer provided');
      return false;
    }

    try {
      // Create the XMTP client with the signer
      this.client = await Client.create(signer, { env: 'production' });
      this.isInitialized = true;
      console.log('XMTP client initialized for address:', await signer.getAddress());
      return true;
    } catch (error) {
      console.error('Failed to initialize XMTP client:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Check if an address can receive XMTP messages
   * @param {string} address - Ethereum address to check
   * @returns {Promise<boolean>} - True if the address can receive messages
   */
  async canMessage(address) {
    if (!this.isInitialized || !this.client) {
      console.error('XMTP client not initialized');
      return false;
    }

    try {
      return await this.client.canMessage(address);
    } catch (error) {
      console.error('Error checking if address can receive messages:', error);
      return false;
    }
  }

  /**
   * List all conversations for the connected wallet
   * @returns {Promise<Array>} - List of conversations
   */
  async listConversations() {
    if (!this.isInitialized || !this.client) {
      console.error('XMTP client not initialized');
      return [];
    }

    try {
      this.conversations = await this.client.conversations.list();
      return this.conversations;
    } catch (error) {
      console.error('Error listing conversations:', error);
      return [];
    }
  }

  /**
   * Create or load a conversation with a specific address
   * @param {string} address - The recipient's Ethereum address
   * @returns {Promise<object|null>} - The conversation object or null
   */
  async getConversation(address) {
    if (!this.isInitialized || !this.client) {
      console.error('XMTP client not initialized');
      return null;
    }

    try {
      if (!await this.canMessage(address)) {
        console.warn(`Address ${address} cannot be messaged via XMTP`);
        return null;
      }

      const conversation = await this.client.conversations.newConversation(address);
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  /**
   * Send a message to a specific address
   * @param {string} address - Recipient's Ethereum address
   * @param {string} content - Message content
   * @returns {Promise<object|null>} - The sent message or null
   */
  async sendMessage(address, content) {
    if (!this.isInitialized || !this.client) {
      console.error('XMTP client not initialized');
      return null;
    }

    try {
      const conversation = await this.getConversation(address);
      if (!conversation) {
        return null;
      }

      const message = await conversation.send(content);
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Get all messages from a conversation with a specific address
   * @param {string} address - Ethereum address of the conversation partner
   * @returns {Promise<Array>} - Array of messages
   */
  async getMessages(address) {
    if (!this.isInitialized || !this.client) {
      console.error('XMTP client not initialized');
      return [];
    }

    try {
      const conversation = await this.getConversation(address);
      if (!conversation) {
        return [];
      }

      const messages = await conversation.messages();
      return messages;
    } catch (error) {
      console.error('Error retrieving messages:', error);
      return [];
    }
  }

  /**
   * Stream new messages in real time for a specific conversation
   * @param {string} address - Ethereum address of the conversation partner
   * @param {function} onMessage - Callback function to handle new messages
   * @returns {Promise<function|null>} - Unsubscribe function or null
   */
  async streamMessages(address, onMessage) {
    if (!this.isInitialized || !this.client) {
      console.error('XMTP client not initialized');
      return null;
    }

    try {
      const conversation = await this.getConversation(address);
      if (!conversation) {
        return null;
      }

      // Create stream for new messages
      const stream = await conversation.streamMessages();
      
      // Process each new message
      for await (const message of stream) {
        onMessage(message);
      }

      // Return an unsubscribe function
      return () => stream.return();
    } catch (error) {
      console.error('Error streaming messages:', error);
      return null;
    }
  }

  /**
   * Disconnect and clean up XMTP client
   */
  disconnect() {
    this.client = null;
    this.conversations = [];
    this.isInitialized = false;
    console.log('XMTP client disconnected');
  }
}

// Create and export a singleton instance
const xmtpService = new XMTPService();
export default xmtpService;
