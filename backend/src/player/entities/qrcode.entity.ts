import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('qrcode')
class QrCode {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  filename: string;

  @Column({
    type: 'bytea',
  })
  data: Uint8Array;
}

export default QrCode;
