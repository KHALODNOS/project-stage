import Cart4 from '../Cart/Cart4';
import "./style.css"
import useHttp from '../../hooks/usehttp';
import { useEffect, useState } from 'react';
import { Novel } from '../../utils/types';
import Loader from '../Loader';
const Completed = () => {
    const { sendData, isLoading, errorMessage } = useHttp();
    const [novels, setNovels] = useState<Novel[]|undefined>([]);  
    useEffect(() => {
      const fetchPopularNovels = () => {
        sendData<Novel[]>(
          '/getnovels/completed',
          { method: 'GET' },
          (data) => {
            setNovels(data);
            // console.log(data)
          }
        );
      };
  
      fetchPopularNovels();
    }, [sendData]);
  
    if (errorMessage) return <p>Error: {errorMessage}</p>;

    console.log(novels)
    return (
        <div className="completed containerbg">
        <div className="bar-simple ">
            <div className="bar">
                <p className='barp'>الروايات المكتملة</p>
                {/* <div className="All">
                    <Link className=' !bg-[#1c8b78]' to="">إظهار الكل</Link>
                </div> */}
            </div>
            <hr />
        </div>
        {isLoading?<Loader smaller={true} />:
        <div className={`carts2 grid gap-[25px] grid-cols-[repeat(auto-fit,minmax(110px,max-content))] mx-[25px] my-0 max767:grid-cols-[repeat(auto-fit,minmax(100px,max-content))] ${novels?.length ?'':'h-16 flex justify-center items-center'} `}>
            {novels?.length?
          novels.map((novel)=>(
            <Cart4 novel={novel}/>
            )
          ) :
          
            <p className='text-[#888]'>لم يتم اضافتها بعد</p>
           
          }
        </div>
        }

    </div>
    );
}

export default Completed;
