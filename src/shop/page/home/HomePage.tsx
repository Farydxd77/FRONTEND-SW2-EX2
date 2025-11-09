import { CustomPagination } from "@/components/custom/CustomPagination"
import { CustomJumbotron } from "@/shop/components/CustomJumbotron"
import { ProductGrids } from "@/shop/components/ProductGrids"
import { useProduts } from "@/shop/hooks/useProduts"

export const HomePage = () => {

  const { data } = useProduts();

  return (
    <>
    <CustomJumbotron title='Todos los productos' />


    <ProductGrids products={ data?.products || []}/>   

    <CustomPagination totalPages={data?.pages || 0}/>
    </>
  )
}
