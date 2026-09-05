import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import * as fs from 'fs';

@Controller()
export class ViewController {
  private getClientDir(): string {
    const env = process.env.NODE_ENV;
    if (env === 'production') {
      return path.join(__dirname, '../../dist/client');
    }
    return path.join(__dirname, '../../../client');
  }

  @Get('*')
  async handleAll(@Res() res: Response) {
    const clientDir = this.getClientDir();
    const indexPath = path.join(clientDir, 'index.html');

    if (!fs.existsSync(indexPath)) {
      res.status(404).send('index.html not found');
      return;
    }

    const html = fs.readFileSync(indexPath, 'utf-8');
    const rendered = nunjucks.renderString(html, {});
    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  }
}
