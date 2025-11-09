import { CustomPagination } from "@/components/custom/CustomPagination"
import { CustomJumbotron } from "@/shop/components/CustomJumbotron"
import { ProductGrids } from "@/shop/components/ProductGrids"
import { useProduts } from "@/shop/hooks/useProduts"
import { useParams } from "react-router"

export const GenderPage = () => {

  const { data } = useProduts()

  const { gender } = useParams();

  const genderLabel = gender === 'men'
  ? 'Hombres' : gender === 'women' ? 'Mujeres': 'Niños';


  return (
   <>
     <CustomJumbotron title={`Productos para ${ genderLabel }`} />
    
    
        <ProductGrids products={ data?.products || []}/>   
    
        <CustomPagination totalPages={ data?.pages || 1}/>
   
   </>
  )
}
