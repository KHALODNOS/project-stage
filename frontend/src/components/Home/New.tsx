import Cart5 from '../Cart/Cart5';
import useHttp from '../../hooks/usehttp';
import { Novel } from '../../utils/types';
import { useEffect, useState } from 'react';
import Loader from '../Loader';

const New = () => {
    const { sendData, isLoading, errorMessage } = useHttp();
    const [novels, setNovels] = useState<Novel[]|undefined>([]);  
    useEffect(() => {
      const fetchPopularNovels = () => {
        sendData<Novel[]>(
          '/getnovels/new',
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
    return (
        <div className="new green-bg containerbg">
            <div className="bar bg-[#1c8b78]">
                <p className="barp text-slate-100">توصيات</p>
                {/* <div className="All">
                    <Link to="">إظهار الكل</Link>
                </div> */}
            </div>
        {isLoading?<Loader smaller={true} />:
        <div className={`carts2 grid gap-[25px] grid-cols-[repeat(auto-fit,minmax(110px,max-content))] mx-[25px] my-0 max767:grid-cols-[repeat(auto-fit,minmax(100px,max-content))] ${novels?.length? '':'h-20 flex justify-center items-center'} `}>

        {novels?.length? 
        novels.map((novel)=>(
            <Cart5 novel={novel}/>
            )):
            <p className='text-[#888]'>لم يتم اضافتها بعد</p>

          }

        </div>
        }
    </div>

    );
}

export default New;
