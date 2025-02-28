'use client'
import React, { useState, useEffect, useRef, MouseEvent, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// 컴포넌트 타입 정의
interface ColorPaletteItem {
  color: string;
  image: string;
  text: string;
}

interface Position {
  x: number;
  y: number;
}

interface ImageCache {
  [key: string]: HTMLImageElement;
}

const ImageMosaicCanvas: React.FC = () => {
  const [imageData, setImageData] = useState<HTMLImageElement | null>(null);
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [showPixelNumbers, setShowPixelNumbers] = useState<boolean>(true);
  const [transparentAsWhite] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  
  // 고정된 색상 팔레트 정의 (사용자가 직접 정의할 예정)
  const colorPalette = useRef<ColorPaletteItem[]>([
    { color: '#191919', image: 'ink.png', text: '-1' },
    { color: '#161616', image: 'ink.png', text: '0' },
    { color: '#131313', image: 'ink.png', text: '1' },
    { color: '#101010', image: 'ink.png', text: '2' },

    { color: '#FD1A1E', image: 'red.png', text: '-1' },
    { color: '#D6161A', image: 'red.png', text: '0' },
    { color: '#AB1114', image: 'red.png', text: '1' },
    { color: '#7D0B0E', image: 'red.png', text: '2' },

    { color: '#5D7532', image: 'green.png', text: '-1' },
    { color: '#50642B', image: 'green.png', text: '0' },
    { color: '#415024', image: 'green.png', text: '1' },
    { color: '#313C1C', image: 'green.png', text: '2' },

    { color: '#5D4530', image: 'brown.png', text: '-1' },
    { color: '#4F3B2A', image: 'brown.png', text: '0' },
    { color: '#413023', image: 'brown.png', text: '1' },
    { color: '#31251B', image: 'brown.png', text: '2' },

    { color: '#2F44A8', image: 'blue.png', text: '-1' },
    { color: '#293A8E', image: 'blue.png', text: '0' },
    { color: '#223072', image: 'blue.png', text: '1' },
    { color: '#1B2554', image: 'blue.png', text: '2' },

    { color: '#753AA8', image: 'purple.png', text: '-1' },
    { color: '#63328E', image: 'purple.png', text: '0' },
    { color: '#502972', image: 'purple.png', text: '1' },
    { color: '#3C2054', image: 'purple.png', text: '2' },

    { color: '#46758F', image: 'cyan.png', text: '-1' },
    { color: '#3C6379', image: 'cyan.png', text: '0' },
    { color: '#315062', image: 'cyan.png', text: '1' },
    { color: '#263C48', image: 'cyan.png', text: '2' },

    { color: '#9F9F9F', image: 'lightgray.png', text: '-1' },
    { color: '#878787', image: 'lightgray.png', text: '0' },
    { color: '#6C6C6C', image: 'lightgray.png', text: '1' },
    { color: '#505050', image: 'lightgray.png', text: '2' },

    { color: '#9CA0B0', image: 'gray.png', text: '-1' },
    { color: '#848795', image: 'gray.png', text: '0' },
    { color: '#6A6D77', image: 'gray.png', text: '1' },
    { color: '#4E5058', image: 'gray.png', text: '2' },

    { color: '#EF779D', image: 'pink.png', text: '-1' },
    { color: '#C96585', image: 'pink.png', text: '0' },
    { color: '#A1526B', image: 'pink.png', text: '1' },
    { color: '#763D4F', image: 'pink.png', text: '2' },

    { color: '#77C528', image: 'lime.png', text: '-1' },
    { color: '#65A723', image: 'lime.png', text: '0' },
    { color: '#52861D', image: 'lime.png', text: '1' },
    { color: '#3D6217', image: 'lime.png', text: '2' },

    { color: '#E1E23E', image: 'yellow.png', text: '-1' },
    { color: '#BEBF35', image: 'yellow.png', text: '0' },
    { color: '#98982C', image: 'yellow.png', text: '1' },
    { color: '#6F7022', image: 'yellow.png', text: '2' },

    { color: '#5E90D1', image: 'lightblue.png', text: '-1' },
    { color: '#517AB1', image: 'lightblue.png', text: '0' },
    { color: '#42628D', image: 'lightblue.png', text: '1' },
    { color: '#324967', image: 'lightblue.png', text: '2' },

    { color: '#A946D1', image: 'magenta.png', text: '-1' },
    { color: '#8F3CB1', image: 'magenta.png', text: '0' },
    { color: '#73318D', image: 'magenta.png', text: '1' },
    { color: '#552667', image: 'magenta.png', text: '2' },

    { color: '#D27737', image: 'orange.png', text: '-1' },
    { color: '#B2652F', image: 'orange.png', text: '0' },
    { color: '#8E5227', image: 'orange.png', text: '1' },
    { color: '#683D1E', image: 'orange.png', text: '2' },

    { color: '#FFFCF4', image: 'bone.png', text: '-1' },
    { color: '#D8D4CE', image: 'bone.png', text: '0' },
    { color: '#ACA9A4', image: 'bone.png', text: '1' },
    { color: '#7D7C78', image: 'bone.png', text: '2' },

    { color: '#F6E69E', image: 'pumpkin.png', text: '-1' },
    { color: '#D0C386', image: 'pumpkin.png', text: '0' },
    { color: '#A69B6C', image: 'pumpkin.png', text: '1' },
    { color: '#78724F', image: 'pumpkin.png', text: '2' },

    { color: '#8D6448', image: 'melon.png', text: '-1' },
    { color: '#78563D', image: 'melon.png', text: '0' },
    { color: '#604532', image: 'melon.png', text: '1' },
    { color: '#473426', image: 'melon.png', text: '2' },

    { color: '#454545', image: 'flint.png', text: '-1' },
    { color: '#3B3B3B', image: 'flint.png', text: '0' },
    { color: '#303030', image: 'flint.png', text: '1' },
    { color: '#252525', image: 'flint.png', text: '2' },

    { color: '#909090', image: 'gunpowder.png', text: '-1' },
    { color: '#7A7A7A', image: 'gunpowder.png', text: '0' },
    { color: '#636363', image: 'gunpowder.png', text: '1' },
    { color: '#494949', image: 'gunpowder.png', text: '2' },

    { color: '#4576FB', image: 'lapisore.png', text: '-1' },
    { color: '#3B64D5', image: 'lapisore.png', text: '0' },
    { color: '#3151AA', image: 'lapisore.png', text: '1' },
    { color: '#253C7C', image: 'lapisore.png', text: '2' },

    { color: '#ffffff', image: 'snow.png', text: '-1' },
    { color: '#D8D8D8', image: 'snow.png', text: '0' },
    { color: '#ACACAC', image: 'snow.png', text: '1' },
    { color: '#7E7E7E', image: 'snow.png', text: '2' },
  ]);
  
  // 이미지 캐시를 위한 상태
  const imageCache = useRef<ImageCache>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 컬러 팔레트 캐시 생성
  const colorCache = useRef<{[key: string]: ColorPaletteItem}>({});
  
  // 이미지 로딩 함수
  const preloadImages = useCallback((): void => {
    colorPalette.current.forEach(item => {
      if (!imageCache.current[item.image]) {
        const img = new Image();
        img.src = item.image;
        imageCache.current[item.image] = img;
      }
    });
  }, []);
  
  // 앱 시작시 이미지 프리로드
  useEffect(() => {
    preloadImages();
    
    // 컬러 캐시 초기화
    colorPalette.current.forEach(item => {
      if (item.color.length <= 7) {
        const r = parseInt(item.color.substring(1, 3), 16);
        const g = parseInt(item.color.substring(3, 5), 16);
        const b = parseInt(item.color.substring(5, 7), 16);
        const key = `${r},${g},${b}`;
        colorCache.current[key] = item;
      }
    });
  }, [preloadImages]);
  
  // 이미지 업로드 처리
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    if(imageData) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImageData(null);
      setProcessedCanvas(null);
      setPosition({ x: 0, y: 0 });
      setZoom(1);
    }
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (!event.target?.result) return;
      
      const img = new Image();
      img.onload = () => {
        setImageData(img);
        // 이미지 로드 시 위치 초기화
        setPosition({ x: 0, y: 0 });
        setZoom(1);
      };
      img.src = event.target.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  // 가장 가까운 팔레트 색상 찾기 - 최적화 버전
  const findClosestColor = useCallback((r: number, g: number, b: number, a: number): ColorPaletteItem | null => {
    // 투명도 처리 - 투명한 경우 흰색 (#ffffff)으로 처리하거나 투명한 색상으로 처리
    if (a < 128) {
      if (transparentAsWhite) {
        // 투명인 경우 흰색으로 처리 (화이트팔레트를 찾아서 반환)
        const whiteColor = colorPalette.current.find(palette => palette.color === '#ffffff');
        if (whiteColor) return whiteColor;
      } else {
        // 투명 색상 팔레트가 있는지 확인 (투명 색상은 #00ff0000 등으로 정의)
        const transparentColor = colorPalette.current.find(palette => 
          palette.color.length === 9 && 
          palette.color.substring(7, 9) === '00'
        );
        if (transparentColor) return transparentColor;
      }
    }
    
    // 정확히 일치하는 색상이 있는지 캐시에서 먼저 확인
    const key = `${r},${g},${b}`;
    if (colorCache.current[key]) {
      return colorCache.current[key];
    }
    
    // 일치하는 색상이 없으면 가장 가까운 색상 찾기
    let closestColor: ColorPaletteItem | null = null;
    let minDistance: number = Number.MAX_VALUE;
    
    for (const palette of colorPalette.current) {
      // 투명 팔레트가 아닌 경우만 비교 (투명한 픽셀은 위에서 처리함)
      if (palette.color.length <= 7) {
        const hex = palette.color;
        // HEX 색상을 RGB로 변환
        const paletteR = parseInt(hex.substring(1, 3), 16);
        const paletteG = parseInt(hex.substring(3, 5), 16);
        const paletteB = parseInt(hex.substring(5, 7), 16);
        
        // 색상 거리 계산 (유클리드 거리) - Math.pow보다 빠른 계산법 사용
        const dr = r - paletteR;
        const dg = g - paletteG;
        const db = b - paletteB;
        const distance = dr*dr + dg*dg + db*db;
        
        if (distance < minDistance) {
          minDistance = distance;
          closestColor = palette;
        }
      }
    }
    
    // 찾은 색상을 캐시에 저장 (빠른 재사용을 위해)
    if (closestColor) {
      colorCache.current[key] = closestColor;
    }
    
    return closestColor;
  }, [transparentAsWhite]);
  
  // 이미지 처리 함수 - 웹 워커나 requestAnimationFrame 사용 없이 청크 처리
  const processImage = useCallback(async () => {
    if (!imageData) return;
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // 임시 캔버스 생성
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) {
      setIsProcessing(false);
      return;
    }
    
    // 임시 캔버스 크기 설정
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    
    // 임시 캔버스에 이미지 그리기
    tempCtx.drawImage(imageData, 0, 0, imageData.width, imageData.height);
    
    // 픽셀 데이터 가져오기
    const imagePixels = tempCtx.getImageData(0, 0, imageData.width, imageData.height);
    
    // 결과 캔버스 생성
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imageData.width * 32;
    resultCanvas.height = imageData.height * 32;
    const resultCtx = resultCanvas.getContext('2d', { willReadFrequently: true });
    if (!resultCtx) {
      setIsProcessing(false);
      return;
    }

    // 배경을 투명하게 설정
    resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    
    // 이미지 처리를 청크로 나누어 수행
    const totalPixels = imageData.width * imageData.height;
    const chunkSize = 100; // 한 번에 처리할 픽셀 수
    let processedPixels = 0;
    
    // 청크 처리 함수
    const processChunk = async (startIndex: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          const endIndex = Math.min(startIndex + chunkSize, totalPixels);
          
          for (let idx = startIndex; idx < endIndex; idx++) {
            const x = idx % imageData.width;
            const y = Math.floor(idx / imageData.width);
            
            const i = idx * 4;
            const r = imagePixels.data[i];
            const g = imagePixels.data[i + 1];
            const b = imagePixels.data[i + 2];
            const a = imagePixels.data[i + 3];
            
            // 색상 찾기
            const closestPalette = findClosestColor(r, g, b, a);
            
            if (closestPalette) {
              const imageObj = imageCache.current[closestPalette.image];
              if (imageObj && imageObj.complete) {
                resultCtx.fillStyle = closestPalette.color;
                resultCtx.fillRect(x * 32, y * 32, 32, 32);
                resultCtx.drawImage(imageObj, x * 32, y * 32, 32, 32);
              } else {
                // 색상으로 대체
                resultCtx.fillStyle = closestPalette.color;
                resultCtx.fillRect(x * 32, y * 32, 32, 32);
              }
              
              // 픽셀 숫자 추가
              if (showPixelNumbers) {
                // 배경 그리기
                resultCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                resultCtx.fillRect(x * 32 + 16, y * 32 + 16, 16, 16);
                
                // 텍스트 설정
                resultCtx.fillStyle = '#000000';
                resultCtx.font = '10px Pretendard';
                resultCtx.textAlign = 'right';
                resultCtx.textBaseline = 'bottom';
                
                // 텍스트 그리기
                const pixelText = `${closestPalette ? closestPalette.text : ''}`;
                resultCtx.fillText(pixelText, (x * 32) + 30, (y * 32) + 30);
              }
            }
          }
          
          processedPixels += (endIndex - startIndex);
          const progress = Math.floor((processedPixels / totalPixels) * 100);
          setProcessingProgress(progress);
          
          resolve();
        }, 0);
      });
    };
    
    // 모든 청크 처리
    for (let i = 0; i < totalPixels; i += chunkSize) {
      await processChunk(i);
    }
    
    // 그리드 그리기
    // 그리드 캔버스 따로 생성해서 오버레이 (성능 개선)
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = resultCanvas.width;
    gridCanvas.height = resultCanvas.height;
    const gridCtx = gridCanvas.getContext('2d');
    
    if (gridCtx) {
      // 모든 픽셀마다 얕은 회색 그리드 그리기 (최적화: 상대적으로 적은 수의 선만 그림)
      gridCtx.strokeStyle = "#777777";
      gridCtx.lineWidth = 0.5;
      
      // 세로선
      for (let x = 0; x <= imageData.width; x++) {
        gridCtx.beginPath();
        gridCtx.moveTo(x * 32, 0);
        gridCtx.lineTo(x * 32, gridCanvas.height);
        gridCtx.stroke();
      }
      
      // 가로선
      for (let y = 0; y <= imageData.height; y++) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y * 32);
        gridCtx.lineTo(gridCanvas.width, y * 32);
        gridCtx.stroke();
      }
      gridCtx.strokeStyle = "#00ff00";
      gridCtx.lineWidth = 3;
      
      // 세로선
      for (let x = 0; x <= imageData.width; x++) {
        gridCtx.beginPath();
        gridCtx.moveTo(x * 32 * 32, 0);
        gridCtx.lineTo(x * 32 * 32, gridCanvas.height);
        gridCtx.stroke();
      }
      
      // 가로선
      for (let y = 0; y <= imageData.height; y++) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y * 32 * 32);
        gridCtx.lineTo(gridCanvas.width, y * 32 * 32);
        gridCtx.stroke();
      }
      // 그리드 캔버스의 내용을 결과 캔버스에 그림
      resultCtx.drawImage(gridCanvas, 0, 0);
    }

    // 처리 완료
    setProcessedCanvas(resultCanvas);
    setIsProcessing(false);
  }, [imageData, showPixelNumbers, findClosestColor]);
  
  // 이미지가 로드될 때마다 처리 실행
  useEffect(() => {
    if (imageData) {
      processImage();
    }
  }, [imageData, processImage]);
  
  // 픽셀 번호 표시 또는 투명 처리 방식이 변경될 때 다시 처리
  useEffect(() => {
    if (imageData) {
      processImage();
    }
  }, [showPixelNumbers, transparentAsWhite, processImage]);
  
  // 캔버스 렌더링
  useEffect(() => {
    if (!processedCanvas || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 캔버스 크기 설정
    canvas.width = processedCanvas.width;
    canvas.height = processedCanvas.height;
    
    // 처리된 이미지 그리기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(processedCanvas, 0, 0);
    
  }, [processedCanvas]);

  // 픽셀 번호 표시 토글
  const togglePixelNumbers = (): void => {
    setShowPixelNumbers(prev => !prev);
  };

  // 줌 조절 (버튼 기반)
  const handleZoomIn = (): void => {
    setZoom(prevZoom => Math.min(prevZoom + 0.2, 5));  // 최대 5배 줌 (성능 위해 제한)
    
    // 중앙 기준으로 줌인
    const container = containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      
      handleZoomAtPoint(centerX, centerY, 0.2);
    }
  };
  
  const handleZoomOut = (): void => {
    setZoom(prevZoom => Math.max(prevZoom - 0.2, 0.2));  // 최소 0.2배 줌
    
    // 중앙 기준으로 줌아웃
    const container = containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      
      handleZoomAtPoint(centerX, centerY, -0.2);
    }
  };
  
  // 포인터 위치 기준 줌 처리 - 스로틀링 적용
  const handleZoomAtPoint = useCallback((clientX: number, clientY: number, zoomDelta: number): void => {
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // 현재 확대/축소 상태에서의 마우스 위치 계산
    const mouseX = clientX - containerRect.left;
    const mouseY = clientY - containerRect.top;
    
    // 현재 Transform 기준의 마우스 위치
    const beforeZoomPosX = (mouseX - position.x) / zoom;
    const beforeZoomPosY = (mouseY - position.y) / zoom;
    
    // 새 줌 값 계산 (제한 적용)
    const newZoom = Math.min(Math.max(zoom + zoomDelta, 0.2), 5);
    
    // 줌 후의 좌표 계산
    const afterZoomPosX = beforeZoomPosX * newZoom;
    const afterZoomPosY = beforeZoomPosY * newZoom;
    
    // 포지션 업데이트
    setPosition({
      x: position.x + (mouseX - afterZoomPosX - position.x),
      y: position.y + (mouseY - afterZoomPosY - position.y)
    });
    
    // 줌 업데이트
    setZoom(newZoom);
  }, [zoom, position]);
  
  // 드래그 처리 (이동)
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>): void => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  // 드래그 이동 - 스로틀링 적용
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>): void => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);
  
  const handleMouseUp = (): void => {
    setIsDragging(false);
  };

  // 휠 이벤트를 사용한 줌 처리 - 디바운스 적용
  const handleWheel = useCallback((e: WheelEvent): void => {
    e.preventDefault();
    
    // 줌 변화량 계산 (휠 방향에 따라)
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1; // 더 작은 증분 사용
    
    // 마우스 위치 기준으로 줌 처리
    handleZoomAtPoint(e.clientX, e.clientY, zoomDelta);
  }, [handleZoomAtPoint]);
  
  // 디바운스된 휠 이벤트 핸들러 생성
  const debouncedWheelHandler = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    // requestAnimationFrame을 사용하여 디바운스 구현
    requestAnimationFrame(() => {
      handleWheel(e);
    });
  }, [handleWheel]);
  
  // 휠 이벤트 리스너 추가 (디바운스 적용)
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', debouncedWheelHandler, { passive: false });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', debouncedWheelHandler);
      }
    };
  }, [debouncedWheelHandler]);
  
  // 이미지 초기화
  const resetImage = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setImageData(null);
    setProcessedCanvas(null);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    setProcessingProgress(0);
  };
  
  return (
    <div className="flex flex-col items-center p-4 gap-4 w-full h-screen">
      <h2 className="text-xl font-bold">플레닛어스 그림 생성기 (planetearth-art.vercel.app)</h2>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="max-w-sm">
          <form>
            <label className="block border-gray-500 border rounded-xl border-2">
              <span className="sr-only">이미지 선택</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                ref={fileInputRef} 
                disabled={isProcessing}
                className="block w-full text-sm text-gray-500
                  file:me-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  disabled:opacity-50
                "
              />
            </label>
          </form>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleZoomIn} 
            className="p-2 bg-blue-500 text-white rounded disabled:opacity-50" 
            title="확대"
            disabled={isProcessing || !imageData}
          >
            <ZoomIn size={20} />
          </button>
          <button 
            onClick={handleZoomOut} 
            className="p-2 bg-blue-500 text-white rounded disabled:opacity-50" 
            title="축소"
            disabled={isProcessing || !imageData}
          >
            <ZoomOut size={20} />
          </button>
          <button 
            onClick={resetImage} 
            className="p-2 bg-red-500 text-white rounded disabled:opacity-50" 
            title="초기화"
            disabled={isProcessing || !imageData}
          >
            <RotateCcw size={20} />
          </button>
          <button 
            onClick={togglePixelNumbers} 
            className={`p-2 ${showPixelNumbers ? 'bg-green-500' : 'bg-gray-500'} text-white rounded disabled:opacity-50`}
            title="픽셀 번호 표시/숨기기"
            disabled={isProcessing || !imageData}
          >
            #{showPixelNumbers ? '숨기기' : '표시'}
          </button>
        </div>
      
        <div className="flex items-center gap-2">
          <span>줌: {zoom.toFixed(1)}x</span>
        </div>
      </div>
      
      {/* 이미지 표시 영역 */}
      <div 
        className="border rounded p-4 bg-gray-100 overflow-hidden relative w-full flex-grow"
        ref={containerRef}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isProcessing ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
            <div className="mb-4">이미지 처리 중... {processingProgress}%</div>
            <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-in-out" 
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        ) : !imageData ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            이미지를 업로드해주세요
          </div>
        ) : (
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: '0 0', // 좌상단 기준 (포인터 기준 줌을 위해 중요)
              transition: 'transform 0s ease'
            }}
          >
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-600 mt-2">
        * 드래그하여 이미지를 이동할 수 있습니다. 마우스 휠로 포인터 위치 기준 확대/축소가 가능합니다.
        {showPixelNumbers && ' 각 픽셀의 명도는 오른쪽 하단에 표시됩니다.'}
        {' '}투명 픽셀은 {transparentAsWhite ? '흰색(#ffffff)으로' : '팔레트의 투명 색상으로'} 처리됩니다.
      </div>
    </div>
  );
};

export default ImageMosaicCanvas;