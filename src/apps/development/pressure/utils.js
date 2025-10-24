#!/usr/bin/env node
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import https from 'https';
import HttpsProxyAgent from 'https-proxy-agent';


export async function uploadFile(url, id, filePath) {

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('id', id);
  form.append('description', '这是一张图片');

  return axios.post(url, form, {
    headers: {
      ...form.getHeaders(),
      // 'Content-Length': form.getLengthSync()
    }
  })

}