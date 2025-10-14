// src/entities/chatbot-history.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('chatbot_history')
export class ChatbotHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_email: string;

  @Column()
  role: 'user' | 'ai';

  @Column('text')
  content: string;

  @CreateDateColumn()
  created_at: Date;
}
