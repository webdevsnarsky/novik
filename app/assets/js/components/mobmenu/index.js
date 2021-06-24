const burgerMenu = document.querySelector('.header__burger'); 
const headerMenuWrap = document.querySelector('.header__menu-wrap'); 
const headerNavActive = document.querySelector('.header__nav'); 


burgerMenu.addEventListener('click', () => {
  document.body.classList.toggle('scroll-hidden')
  burgerMenu.classList.toggle('header__burger-active');
  headerMenuWrap.classList.toggle('header__menu-wrap_active');
  headerNavActive.classList.toggle('header__nav_active');
});