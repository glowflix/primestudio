import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    console.log('🔵 API: Upload start');
    
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      console.error('🔴 No file provided');
      return NextResponse.json({ error: 'File missing' }, { status: 400 });
    }

    const title = String(formData.get('title') || '');
    const category = String(formData.get('category') || 'portrait');
    const model_name = String(formData.get('model_name') || '');
    const active = String(formData.get('active') || 'true') === 'true';
    const user_id = String(formData.get('user_id') || '');

    console.log('📋 Form data:', { title, category, model_name, active, user_id, fileSize: file.size });

    if (!category) {
      console.error('🔴 No category provided');
      return NextResponse.json({ error: 'Category missing' }, { status: 400 });
    }

    const photoId = crypto.randomUUID();
    console.log('🆔 Photo ID generated:', photoId);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    console.log('📦 File converted to base64, size:', dataUri.length);

    // Upload to Cloudinary
    console.log('☁️ Uploading to Cloudinary...');
    const upload = await cloudinary.uploader.upload(dataUri, {
      folder: 'prime-studio',
      public_id: photoId,
      resource_type: 'image',
      overwrite: true,
    });

    console.log('✅ Cloudinary upload success:', upload.secure_url);

    // Insert to Supabase
    console.log('💾 Inserting to Supabase...');
    const { error } = await supabase.from('photos').insert({
      id: photoId,
      title: title || null,
      category,
      model_name: model_name || null,
      image_url: upload.secure_url,
      cloudinary_public_id: upload.public_id,
      active,
      user_id: user_id || null,
    });

    if (error) {
      console.error('🔴 Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Supabase insert success');

    return NextResponse.json({
      ok: true,
      id: photoId,
      image_url: upload.secure_url,
      cloudinary_public_id: upload.public_id,
    });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error('🔴 Upload exception:', error);
    console.error('🔴 Full error:', e);
    return NextResponse.json(
      { error: error || 'Server error' },
      { status: 500 }
    );
  }
}
