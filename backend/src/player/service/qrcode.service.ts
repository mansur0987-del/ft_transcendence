import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import QrCode from '../entities/qrcode.entity';


@Injectable()
class QrCodeService {
  constructor(
    @InjectRepository(QrCode)
    private qrCodeRepository: Repository<QrCode>,
  ) {}

  async uploadDatabaseFile(dataBuffer: Buffer, filename: string) {
    const newFile = await this.qrCodeRepository.create({
      filename,
      data: dataBuffer
    })
    await this.qrCodeRepository.save(newFile);
    return newFile;
  }

  async getFileById(fileId: number) {
    const file = await this.qrCodeRepository.findOneBy({id: fileId});
    return file;
  }
}

export default QrCodeService;
