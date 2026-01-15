import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'src', 'assets');

async function optimizeImages() {
  console.log('🖼️  Otimizando imagens...\n');
  
  const files = await fs.readdir(assetsDir);
  const jpgFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));
  
  for (const file of jpgFiles) {
    const filePath = path.join(assetsDir, file);
    const stats = await fs.stat(filePath);
    const originalSize = stats.size;
    
    // Pular se já é pequeno (menos de 100KB)
    if (originalSize < 100 * 1024 && file !== 'hero-bg.jpg') {
      console.log(`⏭️  ${file} - já otimizado (${(originalSize/1024).toFixed(1)}KB)`);
      continue;
    }
    
    const buffer = await fs.readFile(filePath);
    
    let optimized;
    if (file === 'hero-bg.jpg') {
      // Hero precisa ser otimizado ao máximo - é o LCP
      optimized = await sharp(buffer)
        .resize(1920, 1080, { fit: 'cover', withoutEnlargement: true })
        .jpeg({ quality: 75, mozjpeg: true })
        .toBuffer();
    } else {
      // Outras imagens
      optimized = await sharp(buffer)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();
    }
    
    await fs.writeFile(filePath, optimized);
    
    const newSize = optimized.length;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${file}: ${(originalSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (-${savings}%)`);
  }
  
  console.log('\n✨ Otimização concluída!');
}

optimizeImages().catch(console.error);
