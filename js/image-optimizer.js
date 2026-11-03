/* Patch 9.1 — imagens leves sem bibliotecas, servidor ou mudanças SQL.
   Converte uploads raster para WebP quando houver economia real; mantém transparência.
   O arquivo original permanece intacto se o navegador não suportar a conversão. */
(() => {
  const RULES = Object.freeze({
    gallery: {width:1280,height:1280,quality:.84},
    banner: {width:1600,height:1200,quality:.88},
    bannerMobile: {width:1080,height:1920,quality:.88},
    night: {width:1200,height:1000,quality:.85},
    logo: {width:480,height:300,quality:.86},
    partner: {width:650,height:450,quality:.84}
  });
  const allowed = new Set(['image/jpeg','image/png','image/webp']);
  const ext = file => ({'image/webp':'webp','image/png':'png','image/jpeg':'jpg'})[file.type] || 'jpg';
  const readable = value => `${(value / 1024).toFixed(0)} KB`;

  async function optimize(file, kind='gallery') {
    if (!(file instanceof Blob) || !allowed.has(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
    const settings = RULES[kind] || RULES.gallery;
    let bitmap, image, objectURL;
    try {
      if (typeof createImageBitmap === 'function') {
        bitmap = await createImageBitmap(file, {imageOrientation:'from-image'});
      } else {
        objectURL = URL.createObjectURL(file);
        image = new Image();
        image.decoding = 'async';
        image.src = objectURL;
        if (image.decode) await image.decode();
        else await new Promise((resolve, reject) => {image.onload=resolve;image.onerror=reject;});
      }
      const width = bitmap?.width || image.naturalWidth;
      const height = bitmap?.height || image.naturalHeight;
      if (!width || !height) throw new Error('Não foi possível ler a dimensão da imagem.');
      const scale = Math.min(1,settings.width/width,settings.height/height);
      const newWidth = Math.max(1,Math.round(width*scale));
      const newHeight = Math.max(1,Math.round(height*scale));
      const canvas = document.createElement('canvas');
      canvas.width=newWidth;canvas.height=newHeight;
      const ctx=canvas.getContext('2d', {alpha:true});
      if (!ctx) throw new Error('O navegador não oferece conversão de imagens.');
      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality='high';
      ctx.drawImage(bitmap || image,0,0,newWidth,newHeight);
      const blob=await new Promise(resolve => canvas.toBlob(resolve,'image/webp',settings.quality));
      // Opera com JPEG/PNG originais se WebP não estiver disponível ou se piorar o tamanho.
      if (!blob || blob.type !== 'image/webp' || blob.size >= file.size * .96) {
        return {file,originalBytes:file.size,bytes:file.size,changed:false,width,height};
      }
      const name=String(file.name||'foto').replace(/\.[^.]+$/,'').replace(/[^\w-]+/g,'-').slice(0,40) || 'foto';
      const output=new File([blob],name+'.webp',{type:'image/webp',lastModified:Date.now()});
      return {file:output,originalBytes:file.size,bytes:output.size,changed:true,width:newWidth,height:newHeight};
    } finally {
      bitmap?.close?.();
      if (objectURL) URL.revokeObjectURL(objectURL);
    }
  }
  window.AlegriaImages=Object.freeze({optimize,ext,readable});
})();
