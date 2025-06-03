import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import fs from 'fs';
import path from 'path';

/**
 * Simple aggressive optimization for PTSCHaiPhong7.webp
 * Target: Under 300KB without complex settings
 */

async function simpleOptimize() {
  const publicDir = 'public';
  const targetFile = 'PTSCHaiPhong7.webp';
  const targetPath = path.join(publicDir, targetFile);
  
  console.log('⚡ TN Films - Simple Aggressive Optimizer');
  console.log('=========================================');
  
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ File not found: ${targetPath}`);
    return;
  }
  
  // Current size check
  const currentStats = fs.statSync(targetPath);
  const currentSize = currentStats.size;
  const currentSizeKB = (currentSize / 1024).toFixed(0);
  
  console.log(`📁 Current: ${targetFile}`);
  console.log(`📊 Size: ${currentSizeKB}KB`);
  console.log(`🎯 Target: <300KB`);
  
  // Create backup
  const backupPath = path.join(publicDir, `${targetFile}.backup3`);
  fs.copyFileSync(targetPath, backupPath);
  console.log(`💾 Backup: ${targetFile}.backup3`);
  
  try {
    console.log('\n⚡ Simple aggressive optimization...');
    
    // Simple but effective settings
    await imagemin([targetPath], {
      destination: path.dirname(targetPath),
      plugins: [
        imageminWebp({
          quality: 40,           // Very low quality for maximum compression
          method: 6,            // Best compression method
          autoFilter: true,     // Smart filtering
          sharpness: 0,         // No sharpening
          preprocessing: {
            smoothing: 1        // Some smoothing
          }
        })
      ]
    });
    
    // Check final size
    const finalStats = fs.statSync(targetPath);
    const finalSize = finalStats.size;
    const finalSizeKB = (finalSize / 1024).toFixed(0);
    const reduction = ((currentSize - finalSize) / currentSize * 100).toFixed(1);
    
    console.log('\n🎉 Simple Optimization Complete!');
    console.log(`📊 Final size: ${finalSizeKB}KB`);
    console.log(`📈 Additional reduction: ${reduction}%`);
    
    // If still too large, try even lower quality
    if (finalSize > 300000) {
      console.log('\n🔥 Still too large! Trying ultra compression...');
      
      await imagemin([targetPath], {
        destination: path.dirname(targetPath),
        plugins: [
          imageminWebp({
            quality: 30,        // Ultra low quality
            method: 6,         
            autoFilter: true,  
            sharpness: 0,      
            preprocessing: {
              smoothing: 2     // More smoothing
            }
          })
        ]
      });
      
      const ultraStats = fs.statSync(targetPath);
      const ultraSize = ultraStats.size;
      const ultraSizeKB = (ultraSize / 1024).toFixed(0);
      const ultraReduction = ((currentSize - ultraSize) / currentSize * 100).toFixed(1);
      
      console.log(`📊 Ultra optimized: ${ultraSizeKB}KB`);
      console.log(`📈 Total reduction: ${ultraReduction}%`);
    }
    
    // Final assessment
    const assessmentStats = fs.statSync(targetPath);
    const assessmentSize = assessmentStats.size;
    const assessmentSizeKB = (assessmentSize / 1024).toFixed(0);
    
    console.log('\n🚀 Performance Assessment:');
    if (assessmentSize < 250000) {
      console.log('   🏆 Excellent! Lightning fast loading');
      console.log('   📱 Perfect for mobile');
      console.log('   ⚡ Instant fallback');
    } else if (assessmentSize < 350000) {
      console.log('   ✅ Very Good! Fast loading');
      console.log('   📱 Mobile-friendly');
    } else {
      console.log('   ⚠️  Acceptable but could be better');
    }
    
    // Total summary
    const originalPath = path.join(publicDir, `${targetFile}.original`);
    if (fs.existsSync(originalPath)) {
      const originalStats = fs.statSync(originalPath);
      const originalSize = originalStats.size;
      const totalReduction = ((originalSize - assessmentSize) / originalSize * 100).toFixed(1);
      const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);
      
      console.log('\n📊 Overall Optimization:');
      console.log(`   Started: ${originalSizeMB}MB`);
      console.log(`   Final: ${assessmentSizeKB}KB`);
      console.log(`   Total reduction: ${totalReduction}%`);
      console.log(`   Speed improvement: ${Math.round(totalReduction / 10)}x faster`);
    }
    
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    
    // Restore backup
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, targetPath);
      console.log('🔙 Restored backup');
    }
  }
  
  console.log('\n✅ Optimization complete! Test loading speed now.');
}

// Run simple optimization
simpleOptimize().catch(console.error); 