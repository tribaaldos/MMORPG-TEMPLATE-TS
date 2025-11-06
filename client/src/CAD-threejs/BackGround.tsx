import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { TextureLoader } from "three";
import './BuildingUI.css'
import { texture } from "three/tsl";
export default function BackGround() {
    const { scene } = useThree();
    const [imageUrl, setImageUrl] = useState(null);

    // getting google maps static image
    useEffect(() => {
        const url: any = `https://maps.googleapis.com/maps/api/staticmap?center=Space+Needle,Seattle+WA&zoom=17&size=1024x1024&maptype=satellite&key=AIzaSyAAhqNQiO7azdI63iHFYzQZiTgh12mWYRs`;
        setImageUrl(url);

    }, []);

    // for background texture
    // useEffect(() => {
    //     if (!imageUrl) return;

    //     const loader = new TextureLoader();
    //     const texture = loader.load(
    //         imageUrl,
    //         (tex) => {
    //             scene.background = tex;
    //         },
    //         undefined,
    //         (error) => {
    //             console.error("Error cargando textura:", error);
    //         }
    //     );

    //     // Limpieza si el componente se desmonta
    //     return () => {
    //         texture.dispose();
    //         scene.background = null;
    //     };
    // }, [imageUrl, scene]);
    // return null;

    // for plane texture 
    const loader = new TextureLoader();
    if (!imageUrl) return null;
    const texture = loader.load(imageUrl);

    return (

        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial transparent opacity={1} map={texture} />
        </mesh>
    )

}
